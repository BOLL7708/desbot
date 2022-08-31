<?php include_once('inc/utils.inc.php'); ?>
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
        <?php Utils::loadJSIncludesAndConfigs()?>
        <script type="module" src="./dist/index.js"></script>
    </body>
</html>