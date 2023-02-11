import BaseDataObject from '../BaseDataObject.js'
import {IStringDictionary} from '../../Interfaces/igeneral.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeBasic, PresetPipeCustom} from '../Preset/Pipe.js'

export class ConfigExample extends BaseDataObject {
    public singleInstance = new ConfigExampleSub()
    public singleValue = ''
    public arrayOfStrings: string[] = []
    public dictionaryOfStrings: IStringDictionary = {}
    public arrayOfSubClasses: ConfigExampleSub[] = []
    public dictionaryWithSubClasses: { [key:string]: ConfigExampleSub } = {}
    public arrayOfIds: number[] = []
    public dictionaryOfIds: { [key:string]: number } = {}
}
export class ConfigExampleSub extends BaseDataObject {
    public label: string = ''
    public subClassValue: string = ''
    public subClassArray: number[] = []
}

DataObjectMap.addRootInstance(
    new ConfigExample(),
    'Test config for deeper structures.',
    {
        singleValue: 'Hello!',
        arrayOfStrings: 'Just strings derp.',
        dictionaryOfStrings: 'Just strings with keys',
        arrayOfSubClasses: 'A cake!',
        dictionaryWithSubClasses: 'Oh my...',
        singleInstance: 'A single instance yeah!',
        arrayOfIds: 'A list of objects referenced by IDs only',
        dictionaryOfIds: 'A dictionary of objects referenced by IDs only'
    },
    {
        arrayOfStrings: 'string',
        dictionaryOfStrings: 'string',
        arrayOfSubClasses: ConfigExampleSub.ref(),
        dictionaryWithSubClasses: ConfigExampleSub.ref(),
        arrayOfIds: PresetPipeBasic.refIdLabel('basicTitle'),
        dictionaryOfIds: PresetPipeCustom.refId()
    }
)
DataObjectMap.addSubInstance(
    new ConfigExampleSub(),
    {
        subClassValue: 'Just a subclass value yeah?',
        subClassArray: 'An array of numbers yo!'
    },
    {
        subClassArray: 'number'
    }
)
