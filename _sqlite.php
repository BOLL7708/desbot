<?php
include_once('_init.php');

$db = DB_MySQL::get();

try {
    if(!is_dir('_db')) mkdir('_db');
    if(file_exists('_db/main.sqlite')) {
        header('Location: ./index.php');
        die();
    }
    $sql = new SQLite3('_db/main.sqlite');
} catch (Exception $exception) {
    echo "<p>The extension might not be available, make sure to uncomment: <code>extension=sqlite3</code> in <code>php.ini</code> and restart Apache.</p>";
    die("<p>".$exception->getMessage()."</p>");
}

// Init
$sql->exec("PRAGMA foreign_keys = ON;");

// Create table, indices, constraints and triggers
$sql->exec("
CREATE TABLE IF NOT EXISTS json_store (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  row_created TEXT NOT NULL DEFAULT (datetime('now')),
  row_modified TEXT NOT NULL DEFAULT (datetime('now')),
  group_class TEXT NOT NULL,
  group_key TEXT NOT NULL,
  parent_id INTEGER,
  data_json TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES json_store (row_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_group ON json_store (group_class, group_key);
CREATE INDEX IF NOT EXISTS parent_id_index ON json_store (parent_id);
CREATE TRIGGER IF NOT EXISTS update_row_modified
AFTER UPDATE ON json_store
FOR EACH ROW
BEGIN
  UPDATE json_store SET row_modified = datetime('now') WHERE row_id = NEW.row_id;
END;
");

echo "<pre>";

// Load existing data from MySQL
$allRows = $db->query("SELECT * FROM json_store ORDER BY parent_id, row_id;");

// Insert into SQLite
foreach($allRows as $row) {
    try {
        json_decode($row['data_json'], null , 512, JSON_THROW_ON_ERROR);
        $stmt = $sql->prepare('INSERT OR IGNORE INTO json_store VALUES (:row_id,:row_created,:row_modified,:group_class,:group_key,:parent_id,:data_json);');
        $stmt->bindValue(':row_id', $row['row_id'], SQLITE3_INTEGER);
        $stmt->bindValue(':row_created', $row['row_created']);
        $stmt->bindValue(':row_modified', $row['row_modified']);
        $stmt->bindValue(':group_class', $row['group_class']);
        $stmt->bindValue(':group_key', $row['group_key']);
        $stmt->bindValue(':parent_id', $row['parent_id'], SQLITE3_INTEGER);
        $stmt->bindValue(':data_json', $row['data_json']);
        $result = $stmt->execute();
        echo "<span style='color: green;'>Successfully inserted! ({$row['row_id']}) : <strong>{$row['group_class']}->{$row['group_key']}</strong></span>\n";
    } catch (Exception $exception) {
        echo "<span style='color: red;'>Unable to insert! ({$row['row_id']}) : <strong>{$row['group_class']}->{$row['group_key']}</strong>: ".$exception->getMessage()."</span>\n";
    }
}
$sqliteCount = $sql->querySingle("SELECT COUNT(*) as count FROM json_store;");
if($sqliteCount) {
    $mysqlCount = count($allRows);
    if($mysqlCount == $sqliteCount) {
        echo "<h1 style='color: green;'>SUCCESSFULLY INSERTED ALL $sqliteCount ROWS!</h1>\n";
    } else {
        echo "<h1 style='color: red;'>DID NOT MANAGE TO INSERT ALL ROWS! $sqliteCount/$mysqlCount</h1>\n";
    }
    echo '<p><a href="index.php">Go back to the editor!</p>';
} else {
    echo "<h1 style='color: red;'>DID NOT MANAGE TO LOAD ANY ROWS!?</h1>\n";
}
echo "<script>window.scrollTo(0, document.body.scrollHeight);</script>";