<?php include_once('inc/utils.php'); ?>

<?php

if (!empty($_REQUEST['uri'])) {
    $uri = preg_replace("/(^\/)|(\/$)/","",$_REQUEST['uri']);

    $el = explode('/', $uri, 2);

    $path = $el[0];

    if (isset($el[1])) $val = $el[1];

    switch ($path) {
        case 'wh':
            if (!isset($val)) {
                die("No key supplied!");
            }

            Utils::enqueueWebhook($val);
            break;
        case 'wh-clear':
            Utils::clearWebhookQueue();
            break;
        case 'wh-get':
            $queue = Utils::getWebhookQueue();

            echo json_encode($queue, JSON_PRETTY_PRINT);
            break;
        default:
            echo 'unknown path: ' . $uri;
            break;
    }

    die();
}

Utils::clearWebhookQueue();

?>

<html>
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
        <?=Utils::loadJSFiles()?>
        <script>
            MainController.init()
        </script>
    </body>
</html>