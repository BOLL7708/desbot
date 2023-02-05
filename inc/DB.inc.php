<?php
class DB {
    // region Singleton
    private static DB|null $instance = null;
    static function get():DB {
        if(self::$instance == null) self::$instance = new DB();
        return self::$instance;
    }
    // endregion

    // region General Database Functions
    private mysqli $mysqli;
    public function __construct()
    {
        $dbData = Files::read('db.php');
        $database = preg_replace("/[^a-z0-9_-]+/i", '', $dbData->database ?? '');
        try {
            // Default connection
            $this->mysqli = new mysqli(
                $dbData->host ?? '',
                $dbData->username ?? '',
                $dbData->password ?? '',
                $database,
                intval($dbData->port ?? '')
            );
        } catch (Exception $exception) {
            // Unknown database, we need to create it, connect again without DB.
            if($exception->getCode() == 1049) {
                $this->mysqli = new mysqli(
                    $dbData->host ?? '',
                    $dbData->username ?? '',
                    $dbData->password ?? '',
                    null,
                    intval($dbData->port ?? '')
                );
                $connectionError = $this->mysqli->connect_error;
                if($connectionError) Utils::exitWithError($connectionError, 3002);

                // Create the database as defined by the user
                $query = /** @lang MariaDB */
                    "CREATE DATABASE IF NOT EXISTS `$database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
                $createResult = $this->mysqli->query($query);
                if($createResult) $this->mysqli->select_db($database);
                else Utils::exitWithError($this->mysqli->error ?? 'Unable to create database', 3003);
            }
            else Utils::exitWithError($exception->getMessage().', code: '.$exception->getCode(), 3004);
        }
        $connectionError = $this->mysqli->connect_error ?? null;
        if($connectionError) Utils::exitWithError($connectionError, 3001);
    }

    /**
     * @param string $query
     * @param array $params
     * @return array|bool Array if there are rows, bool otherwise.
     */
    private function query(string $query, array $params = []):array|bool {
        $stmt = $this->mysqli->prepare($query);
        if(!empty($params)) {
            $types = self::getParamTypes($params);
            $stmt->bind_param($types, ...$params);
        }
        $executeBool = $stmt->execute();
        $result = $stmt->get_result();

        // Bool output
        if(is_bool($result)) return $executeBool;

        // Result output
        $output = [];
        while ($row = $result->fetch_assoc()) $output[] = $row;
        return $output;
    }
    // endregion

    // region System
    function test(): bool {
        return !!$this->query('SELECT 1;');
    }

    function migrate(string $filePath): bool {
        $lines = file( $filePath );
        $validLines = [];
        $success = false;
        foreach ( $lines as $line ) {
            // Check for comments
            $splitOnComment = explode('-- ', trim($line));
            $actualStr = trim(array_shift($splitOnComment)) ?? '';
            if(empty($actualStr) || str_starts_with($actualStr, '--')) continue; // Skip empty or commented lines

            // Check for statement ends
            if(str_contains($actualStr, ';')) {
                // If we have a split on semicolon, use the first part as end of the current statement.
                $statementsArr = explode(';', $actualStr);
                $tail = trim(array_pop($statementsArr));
                foreach($statementsArr as $l) {
                    $validLines[] = "$l;";
                    $query = implode(PHP_EOL, $validLines);
                    $validLines = [];
                    $success = !!$this->query($query); // Submit current
                    if(!$success) return false;
                }
                $validLines = empty($tail) ? [] : [$tail]; // Start on the remainder if not empty
            } else {
                $validLines[] = $actualStr;
            }
        }
        if(empty($lines)) return false;
        return $success;
    }
    // endregion

    // region Json Store
    /**
     * Update the groupKey for a specific row.
     * @param string $groupClass
     * @param string $groupKey
     * @param string $newGroupKey
     * @return bool
     */
    function updateKey(string $groupClass, string $groupKey, string $newGroupKey): bool {
        $newKeyAlreadyExists = !!$this->query("SELECT group_key FROM json_store WHERE group_class = ? AND group_key = ? LIMIT 1;", [$groupClass, $newGroupKey]);
        return !$newKeyAlreadyExists && !!$this->query("UPDATE json_store SET group_key = ? WHERE group_class = ? AND group_key = ?;", [$newGroupKey, $groupClass, $groupKey]);
    }

    /**
     * Save an entry, use subcategory and key if you want to be able to update it too.
     * @param string $groupClass
     * @param string|null $groupKey
     * @param string $dataJson
     * @return string|bool The inserted/updated key or false if failed.
     */
    function saveEntry(
        string      $groupClass,
        string|null $groupKey,
        string      $dataJson
    ): string|bool {
        $uuid = $this->getUUID();
        $result = $this->query("
            INSERT INTO json_store (group_class, group_key, data_json) VALUES (?, IFNULL(?, ?), ?)
            ON DUPLICATE KEY
            UPDATE data_json = ?;
        ", [$groupClass, $groupKey, $uuid, $dataJson, $dataJson]);
        return $result ? ($groupKey ?? $uuid) : false;
    }

    /**
     * Will delete one specific entry
     * @param string $groupClass
     * @param string $groupKey
     * @return bool
     */
    function deleteSetting(
        string $groupClass,
        string $groupKey
    ): bool {
        return $this->query(
            "DELETE FROM json_store WHERE group_class = ? AND group_key = ?;",
            [$groupClass, $groupKey]);
    }

    /**
     * Get entries, either a dictionary keyed on groupKey, an array of rows with no groupKey, or a single entry matched on groupKey.
     * @param string $groupClass Class for the setting for the setting.
     * @param string|null $groupKey Supply this to get one specific entry.
     * @return stdClass|array|null
     */
    function getEntries(
        string $groupClass,
        string|null $groupKey = null
    ) : stdClass|array|null {
        $query = 'SELECT * FROM json_store WHERE group_class = ?';
        $params = [$groupClass];
        if($groupKey) {
            $query .= ' AND group_key = ?;';
            $params[] = $groupKey;
        }
        $result = $this->query($query, $params);

        $output = null;
        if(is_array($result)) {
            $output = new stdClass();
            foreach($result as $row) {
                $groupKey = $row['group_key'];
                $output->$groupKey = json_decode($row['data_json']);
            }
        }
        return $output;
    }

    function getClassesWithCounts(string|null $like = null): stdClass {
        $where = '';
        $params = [];
        if($like && strlen($like) > 0) {
            $params[] = str_replace('*', '%', $like);
            $where = 'WHERE group_class LIKE ?';
        }
        $query = "SELECT group_class, COUNT(*) as count FROM json_store $where GROUP BY group_class;";
        $result = $this->query($query, $params);
        $output = new stdClass();
        if(is_array($result)) foreach($result as $row) {
            $group = $row['group_class'];
            $count = $row['count'];
            $output->$group = $count;
        }
        return $output;
    }
    public function getRowIdsWithLabels(string|null $like, string|null $label): stdClass {
        $where = '';
        $params = [];
        if($like && strlen($like) > 0) {
            $params[] = str_replace('*', '%', $like);
            $where = 'WHERE group_class LIKE ?';
        }
        if($label && strlen($label) > 0) {
            array_unshift($params, "$.$label");
            $result = $this->query("SELECT row_id as id, JSON_VALUE(data_json, ?) as label FROM json_store $where;", $params);
        } else {
            $result = $this->query("SELECT row_id as id, group_key as label FROM json_store $where;", $params);
        }
        $output = new stdClass();
        if(is_array($result)) foreach($result as $row) {
            $label = $row['label'];
            $id = $row['id'];
            $output->$id = $label;
        }
        return $output;
    }
    // endregion

    // region Helper Functions
    private function getUUID(): string|null {
        $result = $this->query('SELECT UUID() uuid;');
        return is_array($result) ? array_pop($result)['uuid'] : null;
    }

    private function getParamTypes(array $values): string {
        $result = [];
        foreach($values as $value) {
            if(is_bool($value) || is_int($value)) $result[] = 'i';
            else if(is_float($value)) $result[] = 'd';
            else if(is_string($value)) $result[] = 's';
            else $result[] = 'b';
        }
        return implode('', $result);
    }

    public function output(bool|array|stdClass|null $output): void
    {
        if($output === null) {
            exit(); // Empty response instead of a 404 as that could show an error in the console which will scare some end users.
        } else {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(
                is_bool($output)
                    ? ['result'=>$output]
                    : ($output ?? (object)[])
            );
        }
    }
    // endregion
}