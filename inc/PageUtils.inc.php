<?php

class PageUtils {
    /**
     * Prints the top part of the HTML page.
     * @param bool $topBar
     * @param bool $sideBar
     * @return void
     */
    public static function printTop(bool $topBar = true, bool $sideBar = true): void
    {
        $scriptFile = Utils::getScriptFileName();
        $pageMode = boolval(Files::read('page_mode.json'));
        ?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget: <?=ucfirst($scriptFile)?>></title>
        <link rel="icon" type="image/x-icon" href="./media/sw_logo.ico" />
        <link rel="stylesheet" href="./styles/general.css"/>
        <link rel="stylesheet" href="./styles/_shared.css"/>
        <link rel="stylesheet" href="./styles/editor.css"/><!-- TODO: Should likely be split to what needs to go into general... -->
        <link id="link-page-mode-stylesheet" rel="stylesheet" href="./styles/_<?=$pageMode ? 'dark' : 'bright';?>.css"/>
        <!--<script type="module" src="./inc/ScriptImporter.php"></script>-->
        <?php
            $filePath = "./styles/<?=$scriptFile?>.css";
            if(file_exists($filePath)) {
                echo '<link rel="stylesheet" href="'.$filePath.'">';
            }
        ?>
        <link rel="stylesheet" href="./styles/<?=$scriptFile?>.css"/>
    </head>
    <body>
        <div id="container">
            <?php
            if($topBar) include_once('inc/embeds/TopBar.embed.inc.php');
            ?>
            <div id="page-container">
                <?php if($sideBar) { ?><div id="side-bar"></div><?php } ?>
            <?php
    }

    /**
     * Prints the bottom part of the HTML page.
     * @return void
     */
    public static function printBottom(): void {
        ?>
            </div>
        </div>
    </body>
</html>
        <?php
    }
}