import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingUserVoice extends BaseDataObject {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
}
export class SettingUserName extends BaseDataObject {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingUserMute extends BaseDataObject {
    active: boolean = false
    reason: string = ''
}

DataObjectMap.addRootInstance(new SettingUserVoice())
DataObjectMap.addRootInstance(new SettingUserName())
DataObjectMap.addRootInstance(new SettingUserMute())