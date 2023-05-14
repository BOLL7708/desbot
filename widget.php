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
        <!-- Script -->

        <?php /* Utils::printJSIncludesAndConfigs() */ ?>
        <!--<script type="module" src="./dist/Pages/Widget/WidgetEmbed.js"></script>-->
        <script type="module">

        </script>
        <!-- DOM Elements -->
        <div id="container"></div>
    </body>
    <script type="module">
        import AssetsHelper from './dist/Classes/AssetsHelper.js'
        import MainController from './dist/Pages/Widget/MainController.js'
        async function run() {
            await AssetsHelper.getAll()
            <?php echo Utils::printJSIncludesAndConfigs(); ?>
            await MainController.init()

            // This is used for testing new features directly in the console, can be removed if need be.
            if(<?=$debug?'true':'false';?>) {
                // Instances
                await import('./dist/Singletons/ModulesSingleton.js').then(m => window.modulesSingleton = new m.default())
                await import('./dist/Singletons/StatesSingleton.js').then(m => window.statesSingleton = new m.default())

                // Static classes
                await import('./dist/Classes/TwitchHelixHelper.js').then(m => window.TwitchHelixHelper = m.default)
                await import('./dist/Classes/AssetsHelper.js').then(m => window.AssetsHelper = m.default)
                await import('./dist/Classes/SteamStoreHelper.js').then(m => window.SteamStoreHelper = m.default)
                await import('./dist/Classes/SteamWebHelper.js').then(m => window.SteamWebHelper = m.default)
                await import('./dist/Classes/Utils.js').then(m => window.Utils = m.default)
                await import('./dist/Classes/DataBaseHelper.js').then(m => window.DataBaseHelper = m.default)
                await import('./dist/Objects/BaseDataObject.js').then(m => window.BaseDataObject = m.default)
                await import('./dist/Objects/DataObjectMap.js').then(m => window.DataObjectMap = m.default)
                await import('./dist/Classes/AssetsHelper.js').then(m => window.AssetsHelper = m.default)
            }
        }
        run()
    </script>
</html>