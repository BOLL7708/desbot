import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingDictionaryEntry extends BaseDataObject {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''
}

DataObjectMap.addRootInstance(new SettingDictionaryEntry())