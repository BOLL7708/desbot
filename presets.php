<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Presets</h2>
            <p>It's presets, live with it.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/PresetsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>