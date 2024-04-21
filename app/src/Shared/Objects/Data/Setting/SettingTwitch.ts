import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'
import {TTwitchEventSubEventStatus} from '../../../Classes/TwitchEventSub.js'

export default class SettingTwitchClient extends AbstractData {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingTwitchClient(),
            types: {
                clientId: 'string|secret',
                clientSecret: 'string|secret'
            }
        })
    }
}
export class SettingTwitchTokens extends AbstractData {
    userLogin: string = ''
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingTwitchTokens(),
            types: {
                refreshToken: 'string|secret',
                accessToken: 'string|secret'
            }
        })
    }
}
export class SettingTwitchReward extends AbstractData {
    key: string = ''
    // TODO: This can get extended in the future when we stop relying on keys, might add a title, note, etc.

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingTwitchReward(),
            description: 'Twitch Reward',
            documentation: {
                key: 'Easy to read identifier in the system, edit this as you please.'
            },
            label: 'key'
        })
    }
}
export class SettingTwitchClip extends AbstractData {
    enlist() {
        DataMap.addRootInstance({ instance: new SettingTwitchClip() })
    }
}
export class SettingTwitchRedemption extends AbstractData {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchEventSubEventStatus = 'UNFULFILLED'
    cost: number = 0

    enlist() {
        DataMap.addRootInstance({ instance: new SettingTwitchRedemption() })
    }
}