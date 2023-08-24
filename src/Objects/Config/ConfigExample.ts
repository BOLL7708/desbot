import Data from '../Data.js'
import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../Interfaces/igeneral.js'
import DataMap from '../DataMap.js'
import {PresetPipeBasic} from '../Preset/PresetPipe.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {DataUtils} from '../DataUtils.js'

export class ConfigExample extends Data {
    singleBoolean = false
    singleNumber = 0
    singleNumberRange = 0
    singleString = ''
    singleSecretString = ''
    singleFileString = ''
    singleSubInstance = new ConfigExampleSub()
    singleIdReference: number|PresetPipeBasic = 0
    singleIdReferenceUsingLabel: number|PresetPipeBasic = 0
    singleIdToKeyReference: number|string = ''
    singleIdToKeyReferenceUsingLabel: number|string = ''
    singleIdToGenericReference: number|Data = 0
    singleEnum = OptionEntryUsage.First
    arrayOfBooleans: boolean[] = []
    arrayOfBooleans_use: number = 0
    arrayOfNumbers: number[] = []
    arrayOfStrings: string[] = []
    arrayOfStringsWithEmptyEntry: string[] = ['']
    arrayOfSecretStrings: string[] = []
    arrayOfFileStrings: string[] = []
    arrayOfSubInstances: ConfigExampleSub[] = []
    arrayOfIdReferences: (number|PresetPipeBasic)[] = []
    arrayOfIdReferencesUsingLabels: (number|PresetPipeBasic)[] = []
    arrayOfIdToKeyReferences: (number|string)[] = []
    arrayOfIdToKeyReferencesUsingLabels: (number|string)[] = []
    arrayOfIdToGenericReferences: (number|Data)[] = []
    arrayOfEnum: OptionEntryUsage[] = []
    dictionaryOfBooleans: IBooleanDictionary = {}
    dictionaryOfNumbers: INumberDictionary = {}
    dictionaryOfStrings: IStringDictionary = {}
    dictionaryOfSubInstances: {[key:string]: ConfigExampleSub} = {}
    dictionaryOfIdReferences: {[key:string]: number|PresetPipeBasic} = {}
    dictionaryOfIdReferencesUsingLabels: {[key:string]: number|PresetPipeBasic} = {}
    dictionaryOfIdToKeyReferences: {[key:string]: number|string} = {}
    dictionaryOfIdToKeyReferencesUsingLabels: {[key:string]: number|string} = {}
    dictionaryOfIdToGenericReferences: {[key:string]: number|Data} = {}
    dictionaryOfEnums: { [key:string]: OptionEntryUsage } = {}
    partnerToSingle = ''
    partnerToSingle_active = false
    partnerToSingleAdvanced = ''
    partnerToSingleAdvanced_enum = OptionEntryUsage.First
    partnerToArray: string[] = []
    partnerToArray_withTitle = ''
    partnerToDictionary: IStringDictionary = {}
    partnerToDictionary_repeatsCount = 0
    partnerToEnum = OptionEntryUsage.First
    partnerToEnum_label = ''
    partnerMultiple = false
    partnerMultiple_and = false
    partnerMultiple_or = 0
    partnerMultiple_plus = false
    partnerMultiple_butNot = ''

    enlist() {
        DataMap.addRootInstance(
            new ConfigExample(),
            'This is an example config to display all types of values an object can contain and how to use them. It is not used in the widget.',
            {
                singleBoolean: 'A single boolean flag',
                singleNumber: 'A single number value',
                singleNumberRange: 'A single number value with a range',
                singleString: 'A single string value',
                singleSecretString: 'A single secret string value, use for passwords or API keys, etc.',
                singleSubInstance: 'A single instance of a sub-class',
                singleIdReference: 'A single ID reference to any other object',
                singleIdReferenceUsingLabel: 'A single ID reference displayed with a label',
                singleIdToKeyReference: 'A single ID reference to any other object key',
                singleIdToKeyReferenceUsingLabel: 'A single ID reference to any other object kwy with a label',
                singleIdToGenericReference: 'Contains a single generic entry.',
                singleEnum: '',
                arrayOfBooleans: 'This is an array property with a partner field.',
                arrayOfBooleans_use: 'This is a separate property acting as the partner field.',
                arrayOfNumbers: '',
                arrayOfStrings: '',
                arrayOfSubInstances: '',
                arrayOfIdReferences: '',
                arrayOfIdReferencesUsingLabels: '',
                arrayOfIdToKeyReferences: '',
                arrayOfIdToKeyReferencesUsingLabels: '',
                arrayOfIdToGenericReferences: 'Contains an array of generic entries.',
                arrayOfEnum: '',
                dictionaryOfBooleans: '',
                dictionaryOfNumbers: '',
                dictionaryOfStrings: '',
                dictionaryOfSubInstances: '',
                dictionaryOfIdReferences: '',
                dictionaryOfIdReferencesUsingLabels: '',
                dictionaryOfIdToKeyReferences: '',
                dictionaryOfIdToKeyReferencesUsingLabels: '',
                dictionaryOfIdToGenericReferences: 'Contains a dictionary of generic entries.',
                dictionaryOfEnums: ''
            },
            {
                singleNumberRange: DataUtils.getNumberRangeRef(-100, 100, 5),
                singleSecretString: 'string|secret',
                singleFileString: DataUtils.getStringFileImageRef(),
                singleIdReference: PresetPipeBasic.refId(),
                singleIdReferenceUsingLabel: PresetPipeBasic.refIdLabel(),
                singleIdToKeyReference: PresetPipeBasic.refIdKey(),
                singleIdToKeyReferenceUsingLabel: PresetPipeBasic.refIdKeyLabel(),
                singleIdToGenericReference: Data.genericRef('Setting'),
                singleEnum: OptionEntryUsage.ref(),
                arrayOfBooleans: 'boolean',
                arrayOfBooleans_use: OptionEntryUsage.ref(),
                arrayOfNumbers: 'number',
                arrayOfStrings: 'string',
                arrayOfSecretStrings: 'string|secret',
                arrayOfFileStrings: DataUtils.getStringFileImageRef(),
                arrayOfSubInstances: ConfigExampleSub.ref(),
                arrayOfIdReferences: PresetPipeBasic.refId(),
                arrayOfIdReferencesUsingLabels: PresetPipeBasic.refIdLabel(),
                arrayOfIdToKeyReferences: PresetPipeBasic.refIdKey(),
                arrayOfIdToKeyReferencesUsingLabels: PresetPipeBasic.refIdKeyLabel(),
                arrayOfIdToGenericReferences: Data.genericRef('Setting'),
                arrayOfEnum: OptionEntryUsage.ref(),
                dictionaryOfBooleans: 'boolean',
                dictionaryOfNumbers: 'number',
                dictionaryOfStrings: 'string',
                dictionaryOfSubInstances: ConfigExampleSub.ref(),
                dictionaryOfIdReferences: PresetPipeBasic.refId(),
                dictionaryOfIdReferencesUsingLabels: PresetPipeBasic.refIdLabel(),
                dictionaryOfIdToKeyReferences: PresetPipeBasic.refIdKey(),
                dictionaryOfIdToKeyReferencesUsingLabels: PresetPipeBasic.refIdKeyLabel(),
                dictionaryOfIdToGenericReferences: Data.genericRef('Setting'),
                dictionaryOfEnums: OptionEntryUsage.ref(),
                partnerToSingleAdvanced_enum: OptionEntryUsage.ref(),
                partnerToArray: 'string',
                partnerToDictionary: 'string',
                partnerToEnum: OptionEntryUsage.ref()
            }
        )
    }
}
export class ConfigExampleSub extends Data {
    singleString: string = ''
    singleIdReference: {[key:string]: number|PresetPipeBasic} = {}
    singleEnum: number = OptionEntryUsage.All

    enlist() {
        DataMap.addSubInstance(
            new ConfigExampleSub(),
            {
                singleString: 'A string value',
                singleIdReference: 'A reference to an object'
            },
            {
                singleIdReference: PresetPipeBasic.refId(),
                singleEnum: OptionEntryUsage.ref()
            }
        )
    }
}