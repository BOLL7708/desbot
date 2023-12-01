<?php
include_once '_init.php';
if(!file_exists('_db/main.sqlite')) {
    header('Location: ./_sqlite.php');
    die();
}
PageUtils::printTop();
?>
        <div id="content" style="display:none;">
            <?php Utils::includeFolder('./inc/embeds/setup')?>
        </div>
        <script type="module" src="./dist/Pages/Setup/SetupEmbed.js"></script>
<?php
PageUtils::printBottom();
?>