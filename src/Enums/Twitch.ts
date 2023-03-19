import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumTwitchRewardVisible extends BaseEnum {
    static readonly Enable = 100
    static readonly Disable = 200
}
export class EnumTwitchRewardUsable extends BaseEnum {
    static readonly Unpause = 100
    static readonly Pause = 200

}

EnumObjectMap.addPrototype(
    EnumTwitchRewardVisible,
    'The visibility of a Twitch reward.',
    {
        Enable: 'The reward will be visible.',
        Disable: 'The reward will be hidden.'
    }
)
EnumObjectMap.addPrototype(
    EnumTwitchRewardUsable,
    'The usability of a Twitch reward.',
    {
        Unpause: 'The reward will be available to redeem.',
        Pause: 'The reward will not be possible to redeem.'
    }
)