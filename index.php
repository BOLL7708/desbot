<?php
include_once './init.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Streaming Widget Editor</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <style>
        body { font-family: sans-serif; }
    </style>
</head>
<body>
    <div id="container" style="display:none;">
        <?php Utils::includeFolder('./inc/sections')?>
    </div>
    <script type="module" src="./dist/index.js"></script>
</body>
</html>
