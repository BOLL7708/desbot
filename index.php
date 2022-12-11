<?php
include_once './init.php';
PageUtils::printTop();
?>
        <div id="content" style="display:none;">
            <?php Utils::includeFolder('./inc/embeds/setup')?>
        </div>
        <script type="module" src="./dist/Pages/Setup/SetupEmbed.js"></script>
<?php
PageUtils::printBottom();
?>