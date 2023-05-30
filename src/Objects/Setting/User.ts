import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingUser extends BaseDataObject {
    userName: string = ''
    displayName: string = ''
    voice = new SettingUserVoice()
    name = new SettingUserName()
    mute = new SettingUserMute()
    cheer = new SettingUserCheer()
    sub = new SettingUserSub()
    raid = new SettingUserRaid()
}

export class SettingUserVoice extends BaseDataObject {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
    datetime: string = ''
}
export class SettingUserName extends BaseDataObject {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingUserMute extends BaseDataObject {
    active: boolean = false
    reason: string = ''
    moderatorUserId: number = 0
    datetime: string = ''
}
export class SettingUserSub extends BaseDataObject {
    totalMonths: number = 0
    streakMonths: number = 0
    datetime: string = ''
}
export class SettingUserCheer extends BaseDataObject {
    totalBits: number = 0
    lastBits: number = 0
    datetime: string = ''
}
export class SettingUserRaid extends BaseDataObject {
    totalRaiders: number = 0
    lastRaid: number = 0
    datetime: string = ''
}

DataObjectMap.addRootInstance(
    new SettingUser(),
    'Main settings object for a Twitch user.',
    {
        voice: 'Text to speech voice settings.',
        name: 'Nick-name for text to speech.',
        mute: 'Text-to-speech mute status.',
        cheer: 'Last cheer data.',
        sub: 'Last sub data.',
        raid: 'Last raid data.'
    }, {}, 'displayName')
DataObjectMap.addSubInstance(new SettingUserVoice())
DataObjectMap.addSubInstance(new SettingUserName())
DataObjectMap.addSubInstance(new SettingUserMute())
DataObjectMap.addSubInstance(new SettingUserSub())
DataObjectMap.addSubInstance(new SettingUserCheer())
DataObjectMap.addSubInstance(new SettingUserRaid())