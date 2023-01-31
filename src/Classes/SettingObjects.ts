import {TTwitchRedemptionStatus} from '../Interfaces/itwitch_pubsub.js'
import BaseDataObject, {BaseDataObjectMap} from './BaseDataObject.js'

export default class SettingsObjects extends BaseDataObjectMap {
    constructor() {
        super()
        this.addMainInstance(new SettingUserVoice())
        this.addMainInstance(new SettingUserName())
        this.addMainInstance(new SettingUserMute())
        this.addMainInstance(new SettingDictionaryEntry())
        this.addMainInstance(new SettingTwitchReward())
        this.addMainInstance(new SettingChannelTrophyStat())
        this.addMainInstance(new SettingTwitchSub())
        this.addMainInstance(new SettingTwitchCheer())
        this.addMainInstance(new SettingTwitchClip())
        this.addMainInstance(new SettingStreamQuote())
        this.addMainInstance(new SettingTwitchRedemption())
        this.addMainInstance(new SettingAccumulatingCounter())
        this.addMainInstance(new SettingIncrementingCounter())
        this.addMainInstance(new SettingTwitchClient())
        this.addMainInstance(new SettingTwitchTokens())
        this.addMainInstance(new SettingImportStatus())
        this.addMainInstance(new SettingSteamAchievements(), undefined, undefined, {achieved: 'string'})
    }
}

// Settings
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
export class SettingDictionaryEntry extends BaseDataObject {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingTwitchReward extends BaseDataObject {
    key: string = ''
    // TODO: This can get extended in the future when we stop relying on keys, might add a title, note, etc.
}
export class SettingChannelTrophyStat extends BaseDataObject {
    userId: number = 0
    index: number = 0
}
export class SettingTwitchSub extends BaseDataObject {
    totalMonths: number = 0
    streakMonths: number = 0
}
export class SettingTwitchCheer extends BaseDataObject {
    totalBits: number = 0
    lastBits: number = 0
}
export class SettingTwitchClip extends BaseDataObject {}

export class SettingStreamQuote extends BaseDataObject {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''
}
export class SettingTwitchRedemption extends BaseDataObject {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchRedemptionStatus = 'UNFULFILLED'
    cost: number = 0
}
export class SettingCounterBase extends BaseDataObject {
    count: number = 0
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}

export class SettingTwitchClient extends BaseDataObject {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''
}
export class SettingTwitchTokens extends BaseDataObject {
    userLogin: string = ''
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''
}
export class SettingImportStatus extends BaseDataObject {
    done: boolean = false
}
export class SettingSteamAchievements extends BaseDataObject {
    achieved: string[] = []
}