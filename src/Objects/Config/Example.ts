import BaseDataObject from '../BaseDataObject.js'
import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../Interfaces/igeneral.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeBasic} from '../Preset/Pipe.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ConfigExample extends BaseDataObject {
    singleBoolean = false
    singleNumber = 0
    singleString = ''
    singleSecretString = ''
    singleSubInstance = new ConfigExampleSub()
    singleIdReference: number|PresetPipeBasic = 0
    singleIdReferenceUsingLabel: number|PresetPipeBasic = 0
    singleIdToKeyReference: number|string = ''
    singleIdToKeyReferenceUsingLabel: number|string = ''
    singleIdToGenericReference: number|BaseDataObject = 0
    singleEnum = EnumEntryUsage.First
    arrayOfBooleans: boolean[] = []
    arrayOfBooleans_use: number = 0
    arrayOfNumbers: number[] = []
    arrayOfStrings: string[] = []
    arrayOfSubInstances: ConfigExampleSub[] = []
    arrayOfIdReferences: (number|PresetPipeBasic)[] = []
    arrayOfIdReferencesUsingLabels: (number|PresetPipeBasic)[] = []
    arrayOfIdToKeyReferences: (number|string)[] = []
    arrayOfIdToKeyReferencesUsingLabels: (number|string)[] = []
    arrayOfIdToGenericReferences: (number|BaseDataObject)[] = []
    arrayOfEnum: EnumEntryUsage[] = []
    dictionaryOfBooleans: IBooleanDictionary = {}
    dictionaryOfNumbers: INumberDictionary = {}
    dictionaryOfStrings: IStringDictionary = {}
    dictionaryOfSubInstances: {[key:string]: ConfigExampleSub} = {}
    dictionaryOfIdReferences: {[key:string]: number|PresetPipeBasic} = {}
    dictionaryOfIdReferencesUsingLabels: {[key:string]: number|PresetPipeBasic} = {}
    dictionaryOfIdToKeyReferences: {[key:string]: number|string} = {}
    dictionaryOfIdToKeyReferencesUsingLabels: {[key:string]: number|string} = {}
    dictionaryOfIdToGenericReferences: {[key:string]: number|BaseDataObject} = {}
    dictionaryOfEnums: { [key:string]: EnumEntryUsage } = {}
    partnerToSingle = ''
    partnerToSingle_active = false
    partnerToSingleAdvanced = ''
    partnerToSingleAdvanced_enum = EnumEntryUsage.First
    partnerToArray: string[] = []
    partnerToArray_withTitle = ''
    partnerToDictionary: IStringDictionary = {}
    partnerToDictionary_repeatsCount = 0
    partnerToEnum = EnumEntryUsage.First
    partnerToEnum_label = ''
    partnerMultiple = false
    partnerMultiple_and = false
    partnerMultiple_or = 0
    partnerMultiple_plus = false
    partnerMultiple_butNot = ''
}
export class ConfigExampleSub extends BaseDataObject {
    singleString: string = ''
    singleIdReference: {[key:string]: number|PresetPipeBasic} = {}
    singleEnum: number = EnumEntryUsage.All
}

DataObjectMap.addRootInstance(
    new ConfigExample(),
    'This is an example config to display all types of values an object can contain and how to use them. It is not used in the widget.',
    {
        singleBoolean: 'A single boolean flag',
        singleNumber: 'A single number value',
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
        singleSecretString: 'string|secret',
        singleIdReference: PresetPipeBasic.refId(),
        singleIdReferenceUsingLabel: PresetPipeBasic.refIdLabel('basicTitle'),
        singleIdToKeyReference: PresetPipeBasic.refIdKey(),
        singleIdToKeyReferenceUsingLabel: PresetPipeBasic.refIdKeyLabel('basicTitle'),
        singleIdToGenericReference: BaseDataObject.genericRef('Setting'),
        singleEnum: EnumEntryUsage.ref(),
        arrayOfBooleans: 'boolean',
        arrayOfBooleans_use: EnumEntryUsage.ref(),
        arrayOfNumbers: 'number',
        arrayOfStrings: 'string',
        arrayOfSubInstances: ConfigExampleSub.ref(),
        arrayOfIdReferences: PresetPipeBasic.refId(),
        arrayOfIdReferencesUsingLabels: PresetPipeBasic.refIdLabel('basicTitle'),
        arrayOfIdToKeyReferences: PresetPipeBasic.refIdKey(),
        arrayOfIdToKeyReferencesUsingLabels: PresetPipeBasic.refIdKeyLabel('basicTitle'),
        arrayOfIdToGenericReferences: BaseDataObject.genericRef('Setting'),
        arrayOfEnum: EnumEntryUsage.ref(),
        dictionaryOfBooleans: 'boolean',
        dictionaryOfNumbers: 'number',
        dictionaryOfStrings: 'string',
        dictionaryOfSubInstances: ConfigExampleSub.ref(),
        dictionaryOfIdReferences: PresetPipeBasic.refId(),
        dictionaryOfIdReferencesUsingLabels: PresetPipeBasic.refIdLabel('basicTitle'),
        dictionaryOfIdToKeyReferences: PresetPipeBasic.refIdKey(),
        dictionaryOfIdToKeyReferencesUsingLabels: PresetPipeBasic.refIdKeyLabel('basicTitle'),
        dictionaryOfIdToGenericReferences: BaseDataObject.genericRef('Setting'),
        dictionaryOfEnums: EnumEntryUsage.ref(),
        partnerToSingleAdvanced_enum: EnumEntryUsage.ref(),
        partnerToArray: 'string',
        partnerToDictionary: 'string',
        partnerToEnum: EnumEntryUsage.ref()
    }
)
DataObjectMap.addSubInstance(
    new ConfigExampleSub(),
    {
        singleString: 'A string value',
        singleIdReference: 'A reference to an object'
    },
    {
        singleIdReference: PresetPipeBasic.refId(),
        singleEnum: EnumEntryUsage.ref()
    }
)
