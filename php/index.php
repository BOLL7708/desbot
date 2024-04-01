<?php
include_once '_init.php';
if(!file_exists(DB_SQLite::FILE)) {
    header('Location: ./_sqlite.php');
    die();
}
if(!is_dir('../_user/assets')) {
    mkdir('../_user/assets', recursive: true);
}
PageUtils::printTop();
?>
        <div id="content" style="display:none;">
            <?php Utils::includeFolder('./inc/embeds/setup')?>
        </div>
        <script type="module" src="../app/dist/Client/Pages/Setup/SetupEmbed.js"></script>
<?php
PageUtils::printBottom();
?>