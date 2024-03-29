import DataMap from '../DataMap.js'
import {PresetOBSSource} from '../Preset/PresetOBS.js'
import {OptionScreenshotType} from '../../Options/OptionScreenshotType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import ConfigScreenshots from '../Config/ConfigScreenshots.js'
import Utils from '../../Classes/Utils.js'
import AudioUtils from '../../Classes/AudioUtils.js'
import {DataUtils} from '../DataUtils.js'
import {DataEntries} from '../Data.js'

export class ActionScreenshot extends Action {
    screenshotType = OptionScreenshotType.VRElseOBS
    sourcePreset: number|DataEntries<PresetOBSSource> = 0
    delay: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionScreenshot(),
            tag: '📸',
            description: 'Trigger OBS or VR screenshots.',
            documentation: {
                screenshotType: 'The type of screenshot, OBS screenshots need the source preset to be set.',
                sourcePreset: 'OBS only, set this if you are capturing an OBS screenshot.',
                delay: 'A delay in seconds before triggering the screenshot.'
            },
            types: {
                screenshotType: OptionScreenshotType.ref,
                sourcePreset: PresetOBSSource.ref.id.build()
            }
        })
    }

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a Screenshot action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionScreenshot>(this)
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
                            if(soundConfig) modules.audioPlayer.enqueueAudio(AudioUtils.configAudio(soundConfig))
                        })
                    } else console.warn("No source preset set for OBS source screenshot.")
                }
                function obsScreenshot() {
                    if(sourcePreset) {
                        // We play the audio first here because it is otherwise with bad timing
                        if(soundConfig) modules.audioPlayer.enqueueAudio(AudioUtils.configAudio(soundConfig))
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