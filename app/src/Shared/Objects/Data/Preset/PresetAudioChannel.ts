import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class PresetAudioChannel extends AbstractData {
    channel: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetAudioChannel(),
            description: 'A named audio channel.',
            documentation: {
                channel: 'A channel reference, anything using the same channel will end up in the same queue.'
            }
        })
    }
}