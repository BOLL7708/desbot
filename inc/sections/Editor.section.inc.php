<?php
    $widgetVersion = exec('git rev-list --count master');
?>
<div id="sectionEditor">
    <h2>Not Yet an Editor</h2>
    <p>You can find the actual widget here: <a href="widget.php" target="_blank">Widget</a></p>
    <p id="dbversion">Database version: <strong></strong></p>
    <p id="dbMigration">Highest migration version: <strong></strong></p>
    <p>Widget version: <strong><?=$widgetVersion?></strong></p>
    <p id="signedInChannel">Signed in channel: <strong></strong></p>
    <p id="signedInChatbot">Signed in chatbot: <strong></strong></p>
    <p id="settingsCounts">Registered settings:</p>
</div>