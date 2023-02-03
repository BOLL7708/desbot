import BaseDataObject from '../BaseDataObject.js'
import {IStringDictionary} from '../../Interfaces/igeneral.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeBasic, PresetPipeCustom} from '../Preset/Pipe.js'

export class ConfigExample extends BaseDataObject {
    public singleInstance = new ConfigExampleSub()
    public singleValue = ''
    public arrayOfStrings: string[] = [
        'one', 'two', 'three'
    ]
    public dictionaryOfStrings: IStringDictionary = {
        hello: 'Testing!',
        bye: 'More tests'
    }
    public arrayOfSubClasses: ConfigExampleSub[] = [
        new ConfigExampleSub(),
        new ConfigExampleSub()
    ]
    // TODO: Needs to add interface to add elements to dictionary
    public dictionaryWithSubClasses: { [key:string]: ConfigExampleSub } = {
        dictionaryEntry1: new ConfigExampleSub(),
        dictionaryEntry2: new ConfigExampleSub()
    }
    public arrayOfIds: number[] = []
    public dictionaryOfIds: { [key:string]: number } = {}
}
export class ConfigExampleSub extends BaseDataObject {
    public label: string = 'A Label!'
    public subClassValue: string = 'A value'
    public subClassArray: number[] = [1,2,3]
}

DataObjectMap.addMainInstance(
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
        arrayOfIds: PresetPipeBasic.refIdLabel('label'),
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
