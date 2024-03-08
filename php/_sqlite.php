<html lang="en">
<body>
<pre><h1>Database Init</h1>
<?php
include_once('_init.php');

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

echo '<h1><a href="index.php">Go to the editor!</h1>';
echo "<script>window.scrollTo(0, document.body.scrollHeight);</script>";
?>
</body>
</html>
    