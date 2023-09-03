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
import {IData} from '../Data.js'
import {DataUtils} from '../DataUtils.js'

export class ActionScreenshot extends Action {
    screenshotType = OptionScreenshotType.SuperScreenShotterVR
    sourcePreset: number|IData<PresetOBSSource> = 0
    delay: number = 0

    enlist() {
        DataMap.addRootInstance(
            new ActionScreenshot(),
            'Trigger OBS or VR screenshots.',
            {
                screenshotType: 'The type of screenshot, OBS screenshots need the source preset to be set.',
                sourcePreset: 'OBS only, set this if you are capturing an OBS screenshot.',
                delay: 'A delay in seconds before triggering the screenshot.'
            },
            {
                screenshotType: OptionScreenshotType.ref,
                sourcePreset: PresetOBSSource.ref.id.build()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '📸',
            description: 'Callback that triggers a Screenshot action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionScreenshot>(this)
                const states = StatesSingleton.getInstance()
                const modules = ModulesSingleton.getInstance()
                const userInput = user.input
                const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())
                const soundConfig = DataUtils.ensureValue(screenshotsConfig.callback.captureSoundEffect)
                const sourcePreset = DataUtils.ensureValue(clone.sourcePreset)
                if(userInput) {
                    // This is executed after the TTS with the same nonce has finished.
                    states.nonceCallbacks.set(nonce ?? '', ()=>{
                        switch(clone.screenshotType) {
                            case OptionScreenshotType.OBSSource:
                                if(sourcePreset) {
                                    const messageId = modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName, clone.delay)
                                    states.nonceCallbacks.set(messageId, ()=>{
                                        if(soundConfig) modules.audioPlayer.enqueueAudio(AudioUtils.configAudio(soundConfig))
                                    })
                                } else console.warn("No source preset set for OBS source screenshot.")
                                break
                            case OptionScreenshotType.SuperScreenShotterVR:
                                modules.sssvr.sendScreenshotRequest(key, user, clone.delay)
                                break
                        }
                    })
                } else {
                    switch(clone.screenshotType) {
                        case OptionScreenshotType.OBSSource:
                            if(sourcePreset) {
                                if(soundConfig) modules.audioPlayer.enqueueAudio(AudioUtils.configAudio(soundConfig))
                                modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName)
                            } else console.warn("No source preset set for OBS source screenshot.")
                            break
                        case OptionScreenshotType.SuperScreenShotterVR:
                            modules.sssvr.sendScreenshotRequest(key, user)
                            break
                    }
                }
            }
        }
    }
}