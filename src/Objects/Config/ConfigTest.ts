import Data, {DataEntries} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetText} from '../Preset/PresetText.js'
import {IBooleanDictionary, IDictionary, INumberDictionary, IStringDictionary} from '../../Interfaces/igeneral.js'

export class ConfigTest extends Data {
    singleReference: number|DataEntries<PresetText> = 0
    multiReference: number[]|DataEntries<PresetText> = []
    namedReference: INumberDictionary|DataEntries<PresetText> = {}
    singleNumber: number = 0
    multiNumber: number[] = []
    namedNumber: INumberDictionary = {}
    singleString: string = ''
    multiString: string[] = []
    namedString: IStringDictionary = {}
    singleBoolean: boolean = false
    multiBoolean: boolean[] = []
    namedBoolean: IBooleanDictionary = {}
    singleInstance = new PresetText()
    multiInstance: PresetText[] = []
    namedInstance: IDictionary<PresetText> = {}


    enlist() {
        DataMap.addRootInstance(
            new ConfigTest(),
            'A test config used when testing specific features.',
            {},{
                singleReference: PresetText.ref.id.build(),
                multiReference: PresetText.ref.id.build(),
                namedReference: PresetText.ref.id.build(),
                multiNumber: 'number',
                namedNumber: 'number',
                multiString: 'string',
                namedString: 'string',
                multiBoolean: 'boolean',
                namedBoolean: 'boolean',
                multiInstance: PresetText.ref.build(),
                namedInstance: PresetText.ref.build()
            }
        )
    }
}