import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {TTwitchEventSubEventStatus} from '../../Interfaces/itwitch_eventsub.js'

export class SettingTwitchClient extends Data {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''

    enlist() {
        DataMap.addRootInstance(
            new SettingTwitchClient(),
            '',
            {},
            {
                clientId: 'string|secret',
                clientSecret: 'string|secret'
            }
        )
    }
}
export class SettingTwitchTokens extends Data {
    userLogin: string = ''
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''

    enlist() {
        DataMap.addRootInstance(
            new SettingTwitchTokens(),
            '',
            {},
            {
                refreshToken: 'string|secret',
                accessToken: 'string|secret'
            })
    }
}
export class SettingTwitchReward extends Data {
    key: string = ''
    // TODO: This can get extended in the future when we stop relying on keys, might add a title, note, etc.

    enlist() {
        DataMap.addRootInstance(
            new SettingTwitchReward(),
            'Twitch Reward',
            {
                key: 'Easy to read identifier in the system.'
            },
            {},
            'key'
        )
    }
}
export class SettingTwitchClip extends Data {
    enlist() {
        DataMap.addRootInstance(new SettingTwitchClip())
    }
}
export class SettingTwitchRedemption extends Data {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchEventSubEventStatus = 'UNFULFILLED'
    cost: number = 0

    enlist() {
        DataMap.addRootInstance(new SettingTwitchRedemption())
    }
}