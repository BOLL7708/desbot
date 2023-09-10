import Data, {IData} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetText} from '../Preset/PresetText.js'

export class ConfigTest extends Data {
    singleReference: number|IData<PresetText> = 0
    multiReference: number[]|IData<PresetText> = []
    namedReference: {[key:string]:number}|{[key:string]: IData<PresetText>} = {}

    enlist() {
        DataMap.addRootInstance(
            new ConfigTest(),
            'A test config used when testing specific features.',
            {},{
                singleReference: PresetText.ref.id.build(),
                multiReference: PresetText.ref.id.build(),
                namedReference: PresetText.ref.id.build()
            }
        )
    }
}