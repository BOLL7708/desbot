/*
 * This is the root script that executes the whole bot.
 * Most other things should be classes that won't do anything if run in isolation, but there are exceptions.
 */

// import EasyDebug, {EEasyDebugLogLevel} from './EasyTSUtils/EasyDebug.mts'
// import MainController from './MainController.mts'
import AssetsHelper from './Helpers/AssetsHelper.mts'
import MainController from './Classes/MainController.mts'
// EasyDebug.setLogLevel(EEasyDebugLogLevel.Verbose)
// EasyDebug.log('Test', EEasyDebugLogLevel.None, 'Should not print.')
// EasyDebug.log('Test', EEasyDebugLogLevel.Verbose, 'Verbose.')
// EasyDebug.log('Test', EEasyDebugLogLevel.Debug, 'Debug.')
// EasyDebug.log('Test', EEasyDebugLogLevel.Info, 'Info.')
// EasyDebug.log('Test', EEasyDebugLogLevel.Warning, 'Warning.')
// EasyDebug.log('Test', EEasyDebugLogLevel.Error, 'Error.')

console.log('Running bot!');

(async ()=>{
    // await AssetsHelper.getAll()
    // const files= await AssetsHelper.get('assets/hydrate/', ['.png'])
    // console.log('Files', files)
    // const prep= await AssetsHelper.preparePathsForUse(['assets/dot*', 'assets/snack/*.png'])
    // console.log('Prep', prep)

    await MainController.init()
})()