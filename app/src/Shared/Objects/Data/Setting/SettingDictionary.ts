import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class SettingDictionaryEntry extends AbstractData {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addRootInstance({ instance: new SettingDictionaryEntry() })
    }
}