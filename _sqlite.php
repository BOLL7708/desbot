<?php
include_once('_init.php');

$mysql = DB::get();

try {
    $sql = new SQLite3('_db/test.sqlite');
} catch (Exception $exception) {
    echo "<p>The extension might not be available, make sure to uncomment: <code>extension=sqlite3</code> in php.ini and restart Apache.</p>";
    die("<p>".$exception->getMessage()."</p>");
}
/*
TODO
    Figure out how to replicate the current table, if possible.
    1. What time format to use, seems TEXT with YYYY-MM-DD HH:MM:SS is the most common way.
    2. How to handle setting the time, a default exists, but onupdate? Are there triggers?
    3. How to do the group unique constraint with group_class and group_key?
    4. How to do the parent_id foreign key constraint med delete coalesce?
 */

/*
$sql->exec("CREATE TABLE IF NOT EXISTS json_store (
    `row_id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `row_created` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `row_modified` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `group_class` TEXT NOT NULL,
    `group_key` TEXT NOT NULL,
    `parent_id` INTEGER NULL,
    `data_json` TEXT NOT NULL
)");
*/