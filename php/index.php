<?php

use inc\PageUtils;
use inc\Utils;

include_once '_init.php';
if(!file_exists('_db/main.sqlite')) {
    header('Location: ./_sqlite.php');
    die();
}
if(!is_dir('_assets')) {
    mkdir('_assets');
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