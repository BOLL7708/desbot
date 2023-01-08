<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Settings</h2>
            <p>This page exists for when there are issues, as an easy way to inspect and correct eventual faulty data.</p>
            <p>Settings are values that are automatically stored, accessed and updated by various systems in the widget, and should in general not have to be touched by a human.
            <p>To use this, access any of the settings stored in the database from the list to the left.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/SettingsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>