import ActionScreenshot from '../../../Shared/Objects/Data/Action/ActionScreenshot.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import StatesSingleton from '../../../Shared/Singletons/StatesSingleton.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.mts'
import ConfigScreenshots from '../../../Shared/Objects/Data/Config/ConfigScreenshots.mts'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.mts'
import {OptionScreenshotType} from '../../../Shared/Objects/Options/OptionScreenshotType.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionScreenshotRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers a Screenshot action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionScreenshot)
                const states = StatesSingleton.getInstance()
                const modules = ModulesSingleton.getInstance()
                const userInput = user.input
                const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())

                // OBS screenshot audio is done outside the OBS class as that is an instance stored in modules, and we don't want to make a circular dependency.
                const soundConfig = DataUtils.ensureData(screenshotsConfig.callback.captureSoundEffect)
                const sourcePreset = DataUtils.ensureData(clone.sourcePreset)
                function obsScreenshotWithUserInput() {
                    if(sourcePreset) {
                        const messageId = modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName, clone.delay)
                        states.nonceCallbacks.set(messageId, ()=>{
                            // We play the audio when the screenshot is done here as it depends on when the TTS is done in turn.
                            if(soundConfig) modules.audioPlayer.enqueueAudio(soundConfig)
                        })
                    } else console.warn("No source preset set for OBS source screenshot.")
                }
                function obsScreenshot() {
                    if(sourcePreset) {
                        // We play the audio first here because it is otherwise with bad timing
                        if(soundConfig) modules.audioPlayer.enqueueAudio(soundConfig)
                        modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName, clone.delay)
                    } else console.warn("No source preset set for OBS source screenshot.")
                }
                function sssvrScreenshot() {
                    modules.sssvr.sendScreenshotRequest(key, user, clone.delay)
                }

                if(userInput) {
                    // This is executed after the TTS with the same nonce has finished.
                    states.nonceCallbacks.set(nonce ?? '', ()=>{
                        switch(clone.screenshotType) {
                            case OptionScreenshotType.VRElseOBS:
                                if(modules.sssvr.isConnected()) sssvrScreenshot()
                                else obsScreenshotWithUserInput()
                                break
                            case OptionScreenshotType.OBSSource:
                                obsScreenshotWithUserInput()
                                break
                            case OptionScreenshotType.SuperScreenShotterVR:
                                sssvrScreenshot()
                                break
                        }
                    })
                } else {
                    switch(clone.screenshotType) {
                        case OptionScreenshotType.VRElseOBS:
                            if(modules.sssvr.isConnected()) sssvrScreenshot()
                            else obsScreenshot()
                            break
                        case OptionScreenshotType.OBSSource:
                            obsScreenshot()
                            break
                        case OptionScreenshotType.SuperScreenShotterVR:
                            sssvrScreenshot()
                            break
                    }
                }
            }
        }
    }
}