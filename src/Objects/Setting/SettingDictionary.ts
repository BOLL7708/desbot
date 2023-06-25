import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingDictionaryEntry extends Data {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''

    register() {
        DataMap.addRootInstance(new SettingDictionaryEntry())
    }
}