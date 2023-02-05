<?php
include_once '_init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Config</h2>
            <p>The plan is for this to be the main place for setting up the widget, there is a lot of features to add before this will be possible though.</p>
            <p>Access any of the configs stored in the database from the list to the left.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/ConfigEmbed.js"></script>
<?php
PageUtils::printBottom();
?>