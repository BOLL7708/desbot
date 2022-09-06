<?php
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.
include_once('inc/utils.inc.php');
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