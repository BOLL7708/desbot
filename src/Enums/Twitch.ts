import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumTwitchRewardVisible extends BaseEnum {
    static readonly Visible = 100
    static readonly Hidden = 200
}
export class EnumTwitchRewardUsable extends BaseEnum {
    static readonly Enabled = 100
    static readonly Disabled = 200

}
export class EnumTwitchSubTier extends BaseEnum {
    static readonly Prime = 0
    static readonly Tier1 = 1000
    static readonly Tier2 = 2000
    static readonly Tier3 = 3000
}

EnumObjectMap.addPrototype(
    EnumTwitchRewardVisible,
    'The visibility of a Twitch reward.',
    {
        Visible: 'The reward will be visible.',
        Hidden: 'The reward will be hidden.'
    }
)
EnumObjectMap.addPrototype(
    EnumTwitchRewardUsable,
    'The usability of a Twitch reward.',
    {
        Enabled: 'The reward will be available to redeem.',
        Disabled: 'The reward will not be possible to redeem.'
    }
)
EnumObjectMap.addPrototype(
    EnumTwitchSubTier,
    'The tier of a Twitch subscription.'
)