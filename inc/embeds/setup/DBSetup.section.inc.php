<?php
    $reqUri = $_SERVER['REQUEST_URI'] ?? '';
    if(empty($reqUri)) exit('PHP runs but is broken, fix it.');

    $reqArr = explode('?', $reqUri);
    $reqParts = array_filter(explode('/', array_shift($reqArr))); // Skip fragments, query and trailing slash

    $possibleName = array_pop($reqParts);
    if(str_contains($possibleName, '.')) $possibleName = array_pop($reqParts); // Skip index.php
    $dbName = $possibleName ?? 'streaming_widget'; // Fallback
?>
<div id="sectionDBSetup">
    <h2>Database Setup</h2>
    <p>The widget relies on a MariaDB instance to save and retrieve information. If you are using XAMPP the defaults should be valid, so you can simply click connect.</p>
    <form id="formDBSetup">
        <p><label>Host: <input type="text" name="host" value="localhost"/></label> : <label>Port: <input type="number" name="port" value="3306"/></label></p>
        <p><label>Username: <input type="text" name="username" value="root"/></label></p>
        <p><label>Password: <input type="password" name="password"/></label></p>
        <p><label>Database: <input type="text" name="database" value="<?=$dbName?>"/></label></p>
        <p><input type="submit" value="Connect"/></p>
    </form>
</div>