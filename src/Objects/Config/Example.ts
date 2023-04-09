import BaseDataObject from '../BaseDataObject.js'
import {IBooleanDictionary, INumberDictionary, IStringDictionary} from '../../Interfaces/igeneral.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeBasic} from '../Preset/Pipe.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ConfigExample extends BaseDataObject {
    singleBoolean = false
    singleNumber = 0
    singleNumber_format: string = 'Decimal'
    singleString = ''
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
    arrayOfStrings_active: boolean = false
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
    dictionaryOfEnums: { [key:string]: number } = {}
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
        singleNumber_format: '',
        singleString: 'A single string value',
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
        arrayOfStrings_active: '',
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
        dictionaryOfEnums: EnumEntryUsage.ref()
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
