import Data, {DataEntries} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetText} from '../Preset/PresetText.js'
import {INumberDictionary} from '../../Interfaces/igeneral.js'

export class ConfigTest extends Data {
    singleReference: number|DataEntries<PresetText> = 0
    multiReference: number[]|DataEntries<PresetText> = []
    namedReference: INumberDictionary|DataEntries<PresetText> = {}

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