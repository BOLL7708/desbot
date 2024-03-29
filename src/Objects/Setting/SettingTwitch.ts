import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {TTwitchEventSubEventStatus} from '../../Interfaces/itwitch_eventsub.js'

export class SettingTwitchClient extends Data {
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
export class SettingTwitchTokens extends Data {
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
export class SettingTwitchReward extends Data {
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
export class SettingTwitchClip extends Data {
    enlist() {
        DataMap.addRootInstance({ instance: new SettingTwitchClip() })
    }
}
export class SettingTwitchRedemption extends Data {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchEventSubEventStatus = 'UNFULFILLED'
    cost: number = 0

    enlist() {
        DataMap.addRootInstance({ instance: new SettingTwitchRedemption() })
    }
}