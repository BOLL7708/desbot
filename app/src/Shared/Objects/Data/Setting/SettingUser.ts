import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class SettingUser extends AbstractData {
    userName: string = ''
    displayName: string = ''
    voice = new SettingUserVoice()
    name = new SettingUserName()
    mute = new SettingUserMute()
    cheer = new SettingUserCheer()
    sub = new SettingUserSub()
    raid = new SettingUserRaid()

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingUser(),
            description: 'Main settings object for a Twitch user.',
            documentation: {
                voice: 'Text to speech voice settings.',
                name: 'Nick-name for text to speech.',
                mute: 'Text-to-speech mute status.',
                cheer: 'Last cheer data.',
                sub: 'Last sub data.',
                raid: 'Last raid data.'
            },
            label: 'displayName'
        })
    }
}

export class SettingUserVoice extends AbstractData {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserVoice() })
    }
}
export class SettingUserName extends AbstractData {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserName() })
    }
}
export class SettingUserMute extends AbstractData {
    active: boolean = false
    reason: string = ''
    moderatorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserMute() })
    }
}
export class SettingUserSub extends AbstractData {
    totalMonths: number = 0
    streakMonths: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserSub() })
    }
}
export class SettingUserCheer extends AbstractData {
    totalBits: number = 0
    lastBits: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserCheer() })
    }
}
export class SettingUserRaid extends AbstractData {
    totalRaiders: number = 0
    lastRaid: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserRaid() })
    }
}