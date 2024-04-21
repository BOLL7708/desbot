import AbstractData, {DataEntries} from '../AbstractData.js'
import {IBooleanDictionary, IDictionary, INumberDictionary, IStringDictionary} from '../../../Interfaces/igeneral.js'
import DataMap from '../DataMap.js'
import PresetText from '../Preset/PresetText.js'

export default class ConfigTest extends AbstractData {
    anInstance = new ConfigTestSub()
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
        DataMap.addRootInstance({
            instance: new ConfigTest(),
            description: 'A test config used when testing specific features.',
            types: {
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
        })
    }
}

export class ConfigTestSub extends AbstractData {
    value: number = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigTestSub(),
            documentation: {value: 'A number.'}
        })
    }
}