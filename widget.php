<?php
include_once('init.php');
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget</title>
        <link rel="icon" type="image/x-icon" href="./media/sw_art.ico" />
        <link rel="stylesheet" href="./styles/widget.css"/>
    </head>
    <body>
        <!-- Script -->
        <script type="module">
            import AssetsHelper from './dist/Classes/AssetsHelper.js'
            <?php Utils::printJSAssetFiles()?>
        </script>
        <?php Utils::printJSIncludesAndConfigs()?>
        <script type="module" src="./dist/Pages/Widget/WidgetEmbed.js"></script>

        <!-- DOM Elements -->
        <div id="container"></div>
    </body>
</html>