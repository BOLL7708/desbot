import {ActionAudio} from '../Objects/Action/ActionAudio.js'
import {IAudioAction} from '../Interfaces/iactions.js'
import Utils from './Utils.js'

export default class TempFactory {
    static configAudio(audioConfig: ActionAudio): IAudioAction {
        const audio = audioConfig as IAudioAction
        Utils.applyEntryType(Utils.ensureArray(audio.srcEntries), audioConfig.srcEntries_use)
        return audio
    }
}