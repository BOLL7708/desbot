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
            const randomValue = 10000+(Math.random()*10000)
            /*
            TODO: Manual import of configs as they need to be awaited so we can load assets first
             When we don't have these configs anymore, we can just load the assets and this will
             work for anyone, instead of like now, being hard-coded for me.
            */
            await AssetsHelper.getAll()
            await import (`./dist/Includes/Extensions.js?${randomValue}`)
            await import (`./dist/_configs/config-credentials.js?${randomValue}`)
            await import (`./dist/_configs/config.js?${randomValue}`)
            await import (`./dist/_configs/config+custom.js?${randomValue}`)
            await import (`./dist/_configs/config+games.js?${randomValue}`)
            await import (`./dist/_configs/config+links.js?${randomValue}`)
            await import (`./dist/_configs/config+rewards.js?${randomValue}`)
            await import (`./dist/_configs/config+system.js?${randomValue}`)
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