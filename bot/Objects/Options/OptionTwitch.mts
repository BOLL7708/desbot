import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

export class OptionTwitchRewardVisible extends AbstractOption {
    static readonly NoChange = 0
    static readonly Visible = 100
    static readonly Hidden = 200
}
export class OptionTwitchRewardUsable extends AbstractOption {
    static readonly NoChange = 0
    static readonly Enabled = 100
    static readonly Disabled = 200

}
export class OptionTwitchSubTier extends AbstractOption {
    static readonly Prime = 0
    static readonly Tier1 = 1000
    static readonly Tier2 = 2000
    static readonly Tier3 = 3000
}

OptionsMap.addPrototype({
    prototype: OptionTwitchRewardVisible,
    description: 'The visibility of a Twitch reward.',
    documentation: {
        Visible: 'The reward will be visible.',
        Hidden: 'The reward will be hidden.'
    }
})
OptionsMap.addPrototype({
    prototype: OptionTwitchRewardUsable,
    description: 'The usability of a Twitch reward.',
    documentation: {
        Enabled: 'The reward will be available to redeem.',
        Disabled: 'The reward will not be possible to redeem.'
    }
})
OptionsMap.addPrototype({
    prototype: OptionTwitchSubTier,
    description: 'The tier of a Twitch subscription.'
})