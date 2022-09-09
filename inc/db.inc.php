<?php
class DB {
    // region Singleton
    private static DB|null $instance = null;
    static function get():DB {
        if(self::$instance == null) self::$instance = new DB();
        return self::$instance;
    }
    // endregion

    // region DataBase
    private mysqli $mysqli;
    public function __construct()
    {
        $this->mysqli = new mysqli('localhost', 'root', '', 'streaming_widget');
        $connectionError = $this->mysqli->connect_error;
        if($connectionError) DBUtils::exitWithError($connectionError, 1001);
    }

    /**
     * @param string $query
     * @param array $params
     * @return array|bool Array if there are rows, bool otherwise.
     */
    private function query(string $query, array $params = []):array|bool {
        $stmt = $this->mysqli->prepare($query);
        if(!empty($params)) {
            $types = DBUtils::getParamTypes($params);
            $stmt->bind_param($types, ...$params);
        }
        $executeBool = $stmt->execute();
        $result = $stmt->get_result();

        // Bool output
        if(is_bool($result)) return $executeBool;

        // Array output
        $output = [];
        while ($row = $result->fetch_assoc()) $output[] = json_decode($row['data']);
        return $output;
    }
    // endregion

    // region Settings
    /**
     * Save a setting, optional to have sub-category and/or user ID.
     * @param string $category
     * @param string|null $subcategory
     * @param int|null $userId
     * @param string $jsonStr
     * @param bool $update
     * @return bool If saving was successful or not.
     */
    function saveSetting(string $category, string|null $subcategory, int|null $userId, string $jsonStr, bool $update = false): bool {
        $params = $update
            ? [$jsonStr, $category, $subcategory, $userId]
            : [$category, $subcategory, $userId, $jsonStr];
        return $update
            ? $this->query("UPDATE settings SET data=? WHERE category=? AND subcategory=? AND userId=?;", $params)
            : $this->query("INSERT INTO settings (category, subcategory, userId, data) VALUES (?, ?, ?, ?);", $params);
    }

    /**
     * Get all settings for a category and optional subcategory.
     * @param string $category
     * @param string|null $subcategory
     * @return array
     */
    function getSettings(string $category, string|null $subcategory): array {
        return $subcategory == null
            ? $this->query("SELECT data FROM settings WHERE category = ?", [$category])
            : $this->query("SELECT data FROM settings WHERE category = ? AND subcategory = ?", [$category, $subcategory]);
    }
    /**
     * Get single setting for a user
     * @param string $category Main category for the setting
     * @param string|null $subcategory Sub-category for the setting
     * @param int $userId The user ID to get the setting for
     * @return array
     */
    function getSetting(string $category, string|null $subcategory, int $userId): array {
        return $subcategory == null
            ? $this->query("SELECT data FROM settings WHERE category = ? AND userId = ?",[$category, $userId])
            : $this->query("SELECT data FROM settings WHERE category = ? AND subcategory = ? AND userId = ?", [$category, $subcategory, $userId]);
    }
    // endregion

    // region Configs
    function saveConfig() {

    }
    // endregion
}

class DBUtils {


    static function getParamTypes(array $values): string {
        $result = [];
        foreach($values as $value) {
            if(is_bool($value) || is_int($value)) $result[] = 'i';
            else if(is_float($value)) $result[] = 'd';
            else if(is_string($value)) $result[] = 's';
            else $result[] = 'b';
        }
        return implode('', $result);
    }
}