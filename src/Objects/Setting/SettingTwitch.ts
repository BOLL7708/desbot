import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {TTwitchEventSubEventStatus} from '../../Interfaces/itwitch_eventsub.js'

export class SettingTwitchClient extends BaseDataObject {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''

    register() {
        DataObjectMap.addRootInstance(new SettingTwitchClient())
    }
}
export class SettingTwitchTokens extends BaseDataObject {
    userLogin: string = ''
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''

    register() {
        DataObjectMap.addRootInstance(new SettingTwitchTokens())
    }
}
export class SettingTwitchReward extends BaseDataObject {
    key: string = ''
    // TODO: This can get extended in the future when we stop relying on keys, might add a title, note, etc.

    register() {
        DataObjectMap.addRootInstance(
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
export class SettingTwitchClip extends BaseDataObject {
    register() {
        DataObjectMap.addRootInstance(new SettingTwitchClip())
    }
}
export class SettingTwitchRedemption extends BaseDataObject {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchEventSubEventStatus = 'UNFULFILLED'
    cost: number = 0

    register() {
        DataObjectMap.addRootInstance(new SettingTwitchRedemption())
    }
}