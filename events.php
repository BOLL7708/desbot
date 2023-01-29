<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Events</h2>
            <p>Eventually this will contain the event configs which are now the main motherload of crazy garbagea in the widget.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/EventsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>