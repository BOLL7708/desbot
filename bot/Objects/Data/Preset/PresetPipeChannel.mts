import DataMap from '../DataMap.mts'
import AbstractData from '../AbstractData.mts'

export default class PresetPipeChannel extends AbstractData {
    channel: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPipeChannel(),
            description: 'A named pipe overlay channel.',
            documentation: {
                channel: 'A channel reference, anything using the same channel will end up in the same queue.'
            }
        })
    }
}