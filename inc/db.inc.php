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
        $this->mysqli = new mysqli('localhost', 'root', '', 'streaming_widget');
        $connectionError = $this->mysqli->connect_error;
        if($connectionError) Utils::exitWithError($connectionError, 1001);
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

        // Array output
        $output = [];
        while ($row = $result->fetch_assoc()) $output[] = json_decode($row['dataJson']);
        return $output;
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
     * @return array
     */
    function getSettings(
        string      $groupClass,
        string|null $groupKey)
    : array {
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

    public function output(bool|array|stdClass $output): void
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            is_bool($output)
                ? ['result'=>$output]
                : $output
        );
    }
    // endregion
}