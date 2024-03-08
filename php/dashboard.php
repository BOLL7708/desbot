<?php

use inc\PageUtils;
use inc\Utils;

include_once '_init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2>Future Dashboard</h2>
            <p>The idea is to have this be the substitute for a Stream Deck to manage rewards and settings live.</p>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <!--<script type="module" src="./dist/Pages/Editor/EditorEmbed.js"></script>-->
<?php
PageUtils::printBottom();
?>