import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingDictionaryEntry extends BaseDataObject {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addRootInstance(new SettingDictionaryEntry())
    }
}