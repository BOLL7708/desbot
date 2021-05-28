<?php include_once('inc/utils.php'); ?>
<html>
    <head>
        <?=loadJSFiles()?>
        <title>Favorite Viewer</title>
        <style>
            body { 
                background: black;
                color: white;
                font-family: sans-serif;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }
            #container {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            }

            #displayName {
                display: inline-block;
            }
            #profileImage {
                padding: 4em;
                background-size: cover;
                background-repeat: no-repeat;
                width: 50vh;
                height: 50vh;
            }

            /* audio { display: none; } */
        </style>
    </head>
    <body>
        <div id="container">
            <div id="profileImage"></div>
            <div id="displayName"></div>
        </div>
        <script>
            const fv_controller = new FavoriteViewerController();
        </script>
    </body>
</html>