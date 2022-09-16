<?php
include_once('init.php');
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget</title>
        <style>
            p {
                margin: 0.25em;
                text-shadow: 0 0 6px #000f;
            }
        </style>
    </head>
    <body>
        <script type="module">
            import AssetFiles from './dist/modules/files.js'
            <?php Utils::printJSAssetFiles()?>
        </script>
        <?php Utils::printJSIncludesAndConfigs()?>
        <script type="module" src="./dist/index.js"></script>
    </body>
</html>