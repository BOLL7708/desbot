<?php
include_once('init.php');
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget</title>
        <link rel="icon" type="image/x-icon" href="widget.ico" />
        <style>
            p {
                margin: 0.25em;
                text-shadow: 0 0 6px #000f;
            }
        </style>
    </head>
    <body>
        <script type="module">
            import AssetFiles from './dist/Classes/files.js'
            <?php Utils::printJSAssetFiles()?>
        </script>
        <?php Utils::printJSIncludesAndConfigs()?>
        <script type="module" src="./dist/Widget.js"></script>
    </body>
</html>