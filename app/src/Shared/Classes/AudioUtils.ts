import {ActionAudio} from '../Objects/Action/ActionAudio.js'
import {IAudioAction} from '../Interfaces/iactions.js'
import ArrayUtils from './ArrayUtils.js'
import Utils from './Utils.js'

export default class AudioUtils {
    // TODO: Maybe this should be moved to the audio player class?
    static configAudio(audioConfig: ActionAudio): IAudioAction {
        const audio = audioConfig as IAudioAction
        ArrayUtils.getAsType(Utils.ensureArray(audio.srcEntries), audioConfig.srcEntries_use)
        return audio
    }
}