<?php
include_once('init.php');
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
        <!-- Script -->
        <script type="module">
            import AssetsHelper from './dist/Classes/AssetsHelper.js'
            <?php Utils::printJSAssetFiles()?>
        </script>
        <?php Utils::printJSIncludesAndConfigs()?>
        <script type="module" src="./dist/Pages/Widget/WidgetEmbed.js"></script>
        <script type="module">
            // This is used for testing new features directly in the console, can be removed if need be.
            if(<?=$debug?'true':'false';?>) {
                // Instances
                await import('./dist/Classes/SettingObjects.js').then(m => window.SettingObjects = new m.default())
                await import('./dist/Classes/ConfigObjects.js').then(m => window.ConfigObjects = new m.default())

                // Static classes
                await import('./dist/Classes/TwitchHelixHelper.js').then(m => window.TwitchHelixHelper = m.default)
                await import('./dist/Classes/AssetsHelper.js').then(m => window.AssetsHelper = m.default)
                await import('./dist/Classes/SteamStoreHelper.js').then(m => window.SteamStoreHelper = m.default)
                await import('./dist/Classes/SteamWebHelper.js').then(m => window.SteamWebHelper = m.default)
                await import('./dist/Classes/Utils.js').then(m => window.Utils = m.default)
            }
        </script>
        <!-- DOM Elements -->
        <div id="container"></div>
    </body>
</html>