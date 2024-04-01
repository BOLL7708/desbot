import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingUser extends Data {
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

export class SettingUserVoice extends Data {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserVoice() })
    }
}
export class SettingUserName extends Data {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserName() })
    }
}
export class SettingUserMute extends Data {
    active: boolean = false
    reason: string = ''
    moderatorUserId: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserMute() })
    }
}
export class SettingUserSub extends Data {
    totalMonths: number = 0
    streakMonths: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserSub() })
    }
}
export class SettingUserCheer extends Data {
    totalBits: number = 0
    lastBits: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserCheer() })
    }
}
export class SettingUserRaid extends Data {
    totalRaiders: number = 0
    lastRaid: number = 0
    datetime: string = ''

    enlist() {
        DataMap.addSubInstance({ instance: new SettingUserRaid() })
    }
}