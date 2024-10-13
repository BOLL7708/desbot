import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class SettingDictionaryEntry extends AbstractData {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addRootInstance({ instance: new SettingDictionaryEntry() })
    }
}