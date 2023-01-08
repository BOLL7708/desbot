<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Settings</h2>
            <p>Access any of the settings stored in the database from the list to the left.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/SettingsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>