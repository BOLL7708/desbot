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
                $dbData->port ?? ''
            );
        } catch (Exception $exception) {
            // Unknown database, we need to create it, connect again without DB.
            if($exception->getCode() == 1049) {
                $this->mysqli = new mysqli(
                    $dbData->host ?? '',
                    $dbData->username ?? '',
                    $dbData->password ?? '',
                    null,
                    $dbData->port ?? ''
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
     * @return stdClass|bool Array if there are rows, bool otherwise.
     */
    private function query(string $query, array $params = []):stdClass|bool {
        $stmt = $this->mysqli->prepare($query);
        if(!empty($params)) {
            $types = self::getParamTypes($params);
            $stmt->bind_param($types, ...$params);
        }
        $executeBool = $stmt->execute();
        $result = $stmt->get_result();

        // Bool output
        if(is_bool($result)) return $executeBool;

        // Array output
        $output = new stdClass();
        $rowIndex = 0;
        while ($row = $result->fetch_assoc()) {
            $groupKey = $row['groupKey'];
            $index = empty($groupKey)
                ? $rowIndex
                : $groupKey;
            $output->$index = json_decode($row['dataJson']);
            $rowIndex++;
        }
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
     * Get settings
     * @param string $groupClass Class for the setting for the setting.
     * @param string|null $groupKey Supply this to get one specific entry.
     * @return stdClass
     */
    function getSettings(
        string      $groupClass,
        string|null $groupKey = null)
    : stdClass {
        $query = "SELECT * FROM settings WHERE groupClass = ?";
        $params = [$groupClass];
        if($groupKey) {
            $query .= " AND groupKey = ?;";
            $params[] = $groupKey;
        }
        return $this->query($query, $params);
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
        // TODO: Will this be OK? Guess we'll know when we start to actually use this.
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            is_bool($output)
                ? ['result'=>$output]
                : ($output ?? (object)[])
        );
    }
    // endregion
}