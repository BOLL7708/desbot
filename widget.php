<?php
include_once('_init.php');
$debug = boolval($_REQUEST['debug'] ?? '0');
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Streaming Widget</title>
        <link rel="icon" type="image/x-icon" href="./media/sw_art.ico" />
        <link rel="stylesheet" href="./styles/widget.css"/>
    </head>
    <body>
        <div id="container"></div>
        <script type="module" src="./dist/Pages/Widget/WidgetEmbed.js"></script>
    </body>
</html>