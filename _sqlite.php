<html lang="en">
<body>
<pre><h1>Database Init</h1>
<?php
include_once('_init.php');

$db = DB_MySQL::get(true); // TODO: This should be completely removed after the next version as there will be no more MySQL after that.

try {
    if(!is_dir('_db')) mkdir('_db');
    if(file_exists('_db/main.sqlite')) {
        header('Location: ./index.php');
        die();
    }
    $sql = new SQLite3('_db/main.sqlite');
    echo "<h1>Successfully created SQLite database!</h1>\n";
} catch (Exception $exception) {
    error_log("Unable to open SQLite database: ".$exception->getMessage());
    echo "<p>The extension might not be available, make sure to uncomment: <code>extension=sqlite3</code> in <code>php.ini</code> and restart Apache.</p>";
    die("<p>".$exception->getMessage()."</p>");
}

// Init
$sql->exec("PRAGMA foreign_keys = ON;");

// Create table, indices, constraints and triggers
$createTableQuery = file_get_contents('./migrations/0.sql');
$sql->exec($createTableQuery);


// Load existing data from MySQL
$allRows = [];
try {
    $allRows = $db->query("SELECT * FROM json_store ORDER BY parent_id, row_id;");
} catch(Exception $e) {
    error_log('Unable to open MySQL, this is fine if you never used MySQL: '.$e->getMessage());
}
if($allRows !== false) {
    // Insert into SQLite
    foreach ($allRows as $row) {
        if($row['group_class'] == 'SettingTwitchTokens') continue; // Skipping Twitch tokens as that appears to mess up the setup during a migration.
        try {
            json_decode($row['data_json'], null, 512, JSON_THROW_ON_ERROR);
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
            echo "<span style='color: red;'>Unable to insert! ({$row['row_id']}) : <strong>{$row['group_class']}->{$row['group_key']}</strong>: " . $exception->getMessage() . "</span>\n";
        }
    }
    $sqliteCount = $sql->querySingle("SELECT COUNT(*) as count FROM json_store;");
    if ($sqliteCount) {
        $mysqlCount = count($allRows);
        if ($mysqlCount == $sqliteCount) {
            echo "<h1 style='color: green;'>Successfully inserted all $sqliteCount rows!</h1>\n";
        } else {
            echo "<h1 style='color: red;'>Did not manage to insert all rows! $sqliteCount/$mysqlCount</h1>\n";
        }

    } else {
        echo "<h1 style='color: red;'>Did not manage to load any rows!</h1>\n";
    }
} else {
    echo "<h1 style='color: green;'>Did not find any old MySQL database to migrate, skipping!</h1>\n";
}
echo '<h1><a href="index.php">Go to the editor!</h1>';
echo "<script>window.scrollTo(0, document.body.scrollHeight);</script>";
?>
</body>
</html>
    