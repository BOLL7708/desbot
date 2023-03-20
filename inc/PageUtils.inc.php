<?php

class PageUtils {
    /**
     * Prints the top part of the HTML page.
     * @return void
     */
    public static function printTop(): void
    {
        $scriptFile = Utils::getScriptFileName();
        ?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget: <?=ucfirst($scriptFile)?>></title>
        <link rel="icon" type="image/x-icon" href="./media/sw_logo.ico" />
        <link rel="stylesheet" href="./styles/general.css"/>
        <link rel="stylesheet" href="./styles/editor.css"/>
        <script type="module" src="./inc/ImportAllJS.php"></script>
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
            include_once('inc/embeds/TopBar.embed.inc.php');
            ?>
            <div id="page-container">
                <div id="side-bar"></div>
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