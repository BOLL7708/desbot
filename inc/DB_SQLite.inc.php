<?php
class DB_SQLite {
    // region Singleton
    private static DB_SQLite|null $instance = null;
    static function get():DB_SQLite {
        if(self::$instance == null) self::$instance = new DB_SQLite();
        return self::$instance;
    }
    // endregion

    // region General Database Functions
    private SQLite3 $sqlite;
    public function __construct()
    {
        if(!is_dir('_db')) mkdir('_db');
        // Default connection
        $this->sqlite = new SQLite3('_db/main.sqlite');
    }

    /**
     * @param string $query
     * @param array $params
     * @return array|bool Array if there are rows, bool otherwise.
     */
    public function query(string $query, array $params = []):array|bool {
        $stmt = $this->sqlite->prepare($query);
        if(!empty($params)) {
            foreach($params as $key => $value) {
                $stmt->bindValue(":$key", $value);
            }

        }
        $result = $stmt->execute();

        // Result output
        $output = [];
        while ($row = $result->fetchArray()) $output[] = $row;
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

    static function dump(): int {
        function cleanDir(string $dir): string
        {
            return str_replace("\\", '/', $dir);
        }

        // System vars
        $homeDir = cleanDir($_SERVER['MYSQL_HOME']);
        $exePath = "$homeDir/mysqldump.exe";
        $scriptPath = $_SERVER['SCRIPT_FILENAME'];

        // User vars
        $dbData = Files::read('db.php');
        $username = $dbData->username ?? '';
        $password = $dbData->password ?? '';
        $database = $dbData->database ?? '';

        // Dump vars
        $dumpDir = pathinfo($scriptPath, PATHINFO_DIRNAME) . '/_backups/dumps';
        $version = Files::read('version.json');
        $currentVersion = $version->current ?? 0;
        $dumpFileName = date('Ymd-His')."_v$currentVersion.sql";
        $dumpPath = "$dumpDir/$dumpFileName";

        $dumpSize = -1;
        if (is_file($exePath)) {
            // Ensure dump folder
            if (!is_dir($dumpDir)) {
                mkdir($dumpDir, 0777, true);
            }

            // Execute
            if (strlen($password)) {
                $command = "$exePath -u $username -p$password --databases $database > $dumpPath";
            } else {
                $command = "$exePath -u $username --databases $database > $dumpPath";
            }
            $result = system($command);

            // Result
            if ($result !== false && is_file($dumpPath)) {
                $dumpSize = filesize($dumpPath);
            }
        }
        return $dumpSize;
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
    function updateKey(
        string $groupClass,
        string $groupKey,
        string $newGroupKey
    ): bool {
        $newKeyAlreadyExists = !!$this->query("SELECT group_key FROM json_store WHERE group_class = ? AND group_key = ? LIMIT 1;", [$groupClass, $newGroupKey]);
        return !$newKeyAlreadyExists && !!$this->query("UPDATE json_store SET group_key = ? WHERE group_class = ? AND group_key = ?;", [$newGroupKey, $groupClass, $groupKey]);
    }

    /**
     * Save an entry, use subcategory and key if you want to be able to update it too.
     * @param string $groupClass
     * @param string|null $groupKey
     * @param int|null $parentId
     * @param string $dataJson
     * @return string|bool The inserted/updated key or false if failed.
     */
    function saveEntry(
        string      $groupClass,
        string|null $groupKey,
        int|null    $parentId,
        string      $dataJson
    ): string|bool {
        if(empty($groupKey)) $groupKey = $this->getUUID();
        $result = $this->query("
            INSERT INTO json_store (group_class, group_key, parent_id, data_json) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY
            UPDATE parent_id = ?, data_json = ?;
        ", [$groupClass, $groupKey, $parentId, $dataJson, $parentId, $dataJson]);
        return $result ? $groupKey : false;
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
     * Get entries, an array matched on class and possibly key, then it's a single item array.
     * @param string $groupClass Class for the setting for the setting.
     * @param string|null $groupKey Supply this to get one specific entry.
     * @param bool $noData If true excludes the JSON data.
     * @return array|null
     */
    function getEntries(
        string $groupClass,
        string|null $groupKey = null,
        int|null $parentId = null,
        bool $noData = false
    ): array|null {
        $fields = ['row_id', 'group_class', 'group_key', 'parent_id'];
        if(!$noData) $fields[] = 'data_json';
        $fieldsStr = implode(',', $fields);

        $query = "SELECT $fieldsStr FROM json_store WHERE group_class = ?";
        $params = [$groupClass];
        if($groupKey) {
            $query .= ' AND group_key = ?';
            $params[] = $groupKey;
        }
        if($parentId !== null) {
            $query .= ' AND parent_id = ?';
            $params[] = $parentId;
        }
        $query .= ';';

        $result = $this->query($query, $params);
        return $this->outputEntries($result);
    }
    private function outputEntries($entries): array|null {
        $output = null;
        if(is_array($entries)) {
            $output = [];
            foreach($entries as $row) {
                $item = new stdClass();
                $item->key = $row['group_key'];
                $item->class = $row['group_class'];
                $item->id = $row['row_id'];
                $item->pid = $row['parent_id'];
                $item->data = json_decode($row['data_json'] ?? 'null');
                $output[] = $item;
            }
        }
        return $output;
    }
    public function getEntriesByIds(array $rowIds, int|null $parentId, bool $noData = false): array|null {
        $count = count($rowIds);
        $items = array_fill(0, $count, '?');
        $paramsStr = implode(',', $items);

        $fields = ['row_id', 'group_class', 'group_key', 'parent_id'];
        if(!$noData) $fields[] = 'data_json';
        $fieldsStr = implode(',', $fields);
        $query = "SELECT $fieldsStr FROM json_store WHERE row_id IN ($paramsStr)";
        $params = $rowIds;
        if($parentId !== null) {
            $query .= " AND parent_id = ?";
            $params[] = $parentId;
        }
        $query .= ';';

        $result = $this->query($query, $params);
        return $this->outputEntries($result);
    }

    public function getClassesByIds(array $rowIds, int|null $parentId): array|null {
        return $this->getEntriesByIds($rowIds, $parentId, true);
    }

    /**
     * Specifically used in the editor side menu.
     * @param string|null $like
     * @return stdClass
     */
    function getClassesWithCounts(string|null $like = null, int|null $parentId = null): stdClass {
        $where = '';
        $params = [];
        if($like && strlen($like) > 0) {
            $params[] = str_replace('*', '%', $like);
            $where .= 'WHERE group_class LIKE ?';
        }
        if($parentId !== null) {
            $params[] = $parentId;
            $where .= ' AND parent_id = ?';
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

    /**
     * Possibly not too useful but will remain for now.
     * @param string|null $groupClass
     * @param string|null $groupKey
     * @return stdClass
     */
    public function getRowId(?string $groupClass, ?string $groupKey): stdClass
    {
        $result = 0;
        if(is_string($groupClass) && is_string($groupKey)) {
            $result = $this->query("SELECT row_id as id FROM json_store WHERE group_class = ? AND group_key = ? LIMIT 1;", [$groupClass, $groupKey]);
        }
        $output = new stdClass();
        $output->id = $result[0]['id'] ?? 0;
        $output->class = $groupClass;
        $output->key = $groupKey;
        return $output;
    }

    /**
     * Specifically used in the editor to get ID lists with the key or a specific field as label.
     * @param string|null $like
     * @param string|null $label
     * @param int|null $parentId
     * @return stdClass
     */
    public function getRowIdsWithLabels(
        string|null $like,
        string|null $label,
        int|null $parentId = null
    ): stdClass {
        $where = '';
        $params = [];
        if($like && strlen($like) > 0) {
            $where .= 'WHERE group_class LIKE ?';
            $params[] = str_replace('*', '%', $like);
        }
        if($parentId !== null) {
            $where .= ' AND (parent_id = ? OR parent_id IS NULL)';
            $params[] = $parentId;
        }
        if($label && strlen($label) > 0) {
            array_unshift($params, "$.$label");
            $result = $this->query("SELECT row_id as id, group_key as `key`, JSON_VALUE(data_json, ?) as label, parent_id as pid FROM json_store $where;", $params);
        } else {
            $result = $this->query("SELECT row_id as id, group_key as `key`, '' as label, parent_id as pid FROM json_store $where;", $params);
        }
        $output = new stdClass();
        if(is_array($result)) foreach($result as $row) {
            $id = $row['id'];
            unset($row['id']);
            $output->$id = $row;
        }
        return $output;
    }

    public function search(string $query): array {
        $query = str_replace(['*', '?'], ['%', '_'], $query);
        $output = $this->query('SELECT row_id as id, group_class as `class`, group_key as `key`, parent_id as pid, data_json as data FROM json_store WHERE LOWER(group_key) LIKE LOWER(?) OR LOWER(data_json) LIKE LOWER(?);', [$query, $query]);
        return is_array($output) ? $output : [];
    }

    public function getNextKey(string $groupClass, string $groupKey): array {
        $result = $this->query('SELECT group_key as `key` FROM json_store WHERE group_class = ? AND group_key LIKE ? OR group_key LIKE ?;', [$groupClass, $groupKey, "$groupKey %"]);
        $output = $groupKey;
        if(is_array($result)) {
            $maxSerial = 0;
            $keyLength = strlen($groupKey);
            foreach($result as $row) {
                $key = $row['key'];
                if($key == $groupKey) {
                    $output = null;
                } else {
                    $tail = substr($key, $keyLength);
                    $serial = intval($tail);
                    if($serial > $maxSerial) $maxSerial = $serial;
                }
            }
            if($output == null) {
                $newSerial = $maxSerial+1;
                $output = "$groupKey $newSerial";
            }
        }
        return ['key'=>$output];
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