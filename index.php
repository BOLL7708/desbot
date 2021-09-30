<?php include_once('inc/utils.php'); ?>
<html>
    <head>
        <?=Utils::loadJSFiles()?>
        <title>Streaming Widget</title>
        <style>
            p { 
                margin: 0.25em; 
                text-shadow: 0 0 6px #000f;
            }
        </style>
    </head>
    <body>
        <script>
            const mainController = new MainController()
        </script>
    </body>
</html>