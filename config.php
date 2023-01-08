<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Config</h2>
            <p>Access any of the configs stored in the database from the list to the left.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/ConfigEmbed.js"></script>
<?php
PageUtils::printBottom();
?>