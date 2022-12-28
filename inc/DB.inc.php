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
        $query = file_get_contents($filePath);
        if(empty($query)) return false;
        return $this->query($query);
    }
    // endregion

    // region Settings
    /**
     * Save a setting, use subcategory and key if you want to be able to update it too.
     * @param string $groupClass
     * @param string|null $groupKey
     * @param string $dataJson
     * @return bool If saving was successful or not.
     */
    function saveSetting(
        string      $groupClass,
        string|null $groupKey,
        string      $dataJson
    ): bool {
        return $this->query("
            INSERT INTO settings (groupClass, groupKey, dataJson) VALUES (?, ?, ?)
            ON DUPLICATE KEY
            UPDATE dataJson = ?;
        ", [$groupClass, $groupKey, $dataJson, $dataJson]);
    }

    /**
     * Will delete one specific setting
     * @param string $groupClass
     * @param string $groupKey
     * @return bool
     */
    function deleteSetting(
        string $groupClass,
        string $groupKey
    ): bool {
        return $this->query(
            "DELETE FROM settings WHERE groupClass = ? AND groupKey = ?;",
            [$groupClass, $groupKey]);
    }

    function getSetting(string $groupClass, string $groupKey) {
        return $this->getSettings($groupClass, $groupKey);
    }
    function getSettingsDic(string $groupClass): stdClass {
        return $this->getSettings($groupClass);
    }
    function getSettingsArr(string $groupClass): array {
        return $this->getSettings($groupClass, null, true);
    }

    /**
     * Get settings, either a dictionary keyed on groupKey, an array of rows with no groupKey, or a single item matched on groupKey.
     * @param string $groupClass Class for the setting for the setting.
     * @param string|null $groupKey Supply this to get one specific entry.
     * @param bool $rowsWithNoKeys Set to true to return array of entries with no key.
     * @return stdClass|array|null
     */
    private function getSettings(
        string $groupClass,
        string|null $groupKey = null,
        bool $rowsWithNoKeys = false
    ) : stdClass|array|null {
        $query = 'SELECT * FROM settings WHERE groupClass = ?';
        $params = [$groupClass];
        if($rowsWithNoKeys) {
            $query .= ' AND groupKey IS NULL;';
        } elseif($groupKey) {
            $query .= ' AND groupKey = ?;';
            $params[] = $groupKey;
        }
        $result = $this->query($query, $params);

        $output = null;
        if(is_array($result)) {
            if ($rowsWithNoKeys) {
                $output = [];
                foreach($result as $row) {
                    $output[] = json_decode($row['dataJson']);
                }
            } else {
                $output = new stdClass();
                foreach($result as $row) {
                    $groupKey = $row['groupKey'];
                    $output->$groupKey = json_decode($row['dataJson']);
                }
            }
        }
        return $output;
    }

    function getSettingsClassesWithCounts(): stdClass {
        $query = "SELECT groupClass, COUNT(*) as count FROM settings GROUP BY groupClass;";
        $result = $this->query($query);
        $output = new stdClass();
        if(is_array($result)) foreach($result as $row) {
            $group = $row['groupClass'];
            $count = $row['count'];
            $output->$group = $count;
        }
        return $output;
    }
    // endregion



    // region Configs
    function saveConfig() {

    }
    // endregion



    // region Helper Functions
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
            http_response_code(404);
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