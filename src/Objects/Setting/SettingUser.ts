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

    register() {
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
    }
}

export class SettingUserVoice extends BaseDataObject {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserVoice())
    }
}
export class SettingUserName extends BaseDataObject {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserName())
    }
}
export class SettingUserMute extends BaseDataObject {
    active: boolean = false
    reason: string = ''
    moderatorUserId: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserMute())
    }
}
export class SettingUserSub extends BaseDataObject {
    totalMonths: number = 0
    streakMonths: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserSub())
    }
}
export class SettingUserCheer extends BaseDataObject {
    totalBits: number = 0
    lastBits: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserCheer())
    }
}
export class SettingUserRaid extends BaseDataObject {
    totalRaiders: number = 0
    lastRaid: number = 0
    datetime: string = ''

    register() {
        DataObjectMap.addSubInstance(new SettingUserRaid())
    }
}