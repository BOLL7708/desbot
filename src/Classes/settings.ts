import {TKeys} from '../_data/!keys.js'
import {TTwitchRedemptionStatus} from '../interfaces/itwitch_pubsub.js'

// Settings
export class SettingUserVoice {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
}
export class SettingUserName {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingUserMute {
    active: boolean = false
    reason: string = ''
}
export class SettingDictionaryEntry {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingTwitchReward {
    id: string = ''
}
export class SettingChannelTrophyStat {
    userId: number = 0
    index: number = 0
}
export class SettingTwitchSub {
    totalMonths: number = 0
    streakMonths: number = 0
}
export class SettingTwitchCheer {
    totalBits: number = 0
    lastBits: number = 0
}
export class SettingTwitchClip {}

export class SettingStreamQuote {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''
}
export class SettingTwitchRedemption {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchRedemptionStatus = 'UNFULFILLED'
    cost: number = 0
}
class SettingCounterBase {
    count: number = 0
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}

export class SettingTwitchClient {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''
}
export class SettingTwitchTokens {
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''
}
export class SettingImportStatus {
    done: boolean = false
}
export class SettingSteamAchievement {
    [key: string]: { state: number }
}