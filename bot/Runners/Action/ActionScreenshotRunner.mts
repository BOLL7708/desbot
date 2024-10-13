import {ActionScreenshot, ConfigScreenshots, DataUtils, IActionCallback, IActionUser, OptionScreenshotType} from '../../../lib/index.mts'
import DataBaseHelper from '../../Helpers/DataBaseHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import StatesSingleton from '../../Singletons/StatesSingleton.mts'
import Utils from '../../Utils/Utils.mts'

ActionScreenshot.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Screenshot action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionScreenshot)
         const states = StatesSingleton.getInstance()
         const modules = ModulesSingleton.getInstance()
         const userInput = user.input
         const screenshotsConfig = await DataBaseHelper.loadMain<ConfigScreenshots>(new ConfigScreenshots())

         // OBS screenshot audio is done outside the OBS class as that is an instance stored in modules, and we don't want to make a circular dependency.
         const soundConfig = DataUtils.ensureData(screenshotsConfig.callback.captureSoundEffect)
         const sourcePreset = DataUtils.ensureData(clone.sourcePreset)

         function obsScreenshotWithUserInput() {
            if (sourcePreset) {
               const messageId = modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName, clone.delay)
               states.nonceCallbacks.set(messageId, () => {
                  // We play the audio when the screenshot is done here as it depends on when the TTS is done in turn.
                  if (soundConfig) modules.audioPlayer.enqueueAudio(soundConfig)
               })
            } else console.warn("No source preset set for OBS source screenshot.")
         }

         function obsScreenshot() {
            if (sourcePreset) {
               // We play the audio first here because it is otherwise with bad timing
               if (soundConfig) modules.audioPlayer.enqueueAudio(soundConfig)
               modules.obs.takeSourceScreenshot(key, user, sourcePreset.sourceName, clone.delay)
            } else console.warn("No source preset set for OBS source screenshot.")
         }

         function sssvrScreenshot() {
            modules.sssvr.sendScreenshotRequest(key, user, clone.delay)
         }

         if (userInput) {
            // This is executed after the TTS with the same nonce has finished.
            states.nonceCallbacks.set(nonce ?? '', () => {
               switch (clone.screenshotType) {
                  case OptionScreenshotType.VRElseOBS:
                     if (modules.sssvr.isConnected()) sssvrScreenshot()
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
            switch (clone.screenshotType) {
               case OptionScreenshotType.VRElseOBS:
                  if (modules.sssvr.isConnected()) sssvrScreenshot()
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