import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {TTwitchEventSubEventStatus} from '../../Interfaces/itwitch_eventsub.js'

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
export class SettingTwitchReward extends BaseDataObject {
    key: string = ''
    // TODO: This can get extended in the future when we stop relying on keys, might add a title, note, etc.
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
export class SettingTwitchRedemption extends BaseDataObject {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchEventSubEventStatus = 'unfulfilled'
    cost: number = 0
}

DataObjectMap.addRootInstance(new SettingTwitchClient())
DataObjectMap.addRootInstance(new SettingTwitchTokens())
DataObjectMap.addRootInstance(new SettingTwitchReward(), 'Twitch Reward', { key: 'Easy to read identifier in the system.'})
DataObjectMap.addRootInstance(new SettingTwitchSub())
DataObjectMap.addRootInstance(new SettingTwitchCheer())
DataObjectMap.addRootInstance(new SettingTwitchClip())
DataObjectMap.addRootInstance(new SettingTwitchRedemption())
