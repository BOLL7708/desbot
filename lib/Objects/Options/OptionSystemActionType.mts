import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

/**
 * These are basically things happening in the widget that are not customizable actions, but hard-coded ones.
 */
export class OptionSystemActionType extends AbstractOption {
    static readonly None = 0

    static readonly Chat = 1000
    static readonly ChatOn = 1100
    static readonly ChatOff = 1200
    static readonly PingOn = 1300
    static readonly PingOff = 1400
    static readonly LogOn = 1500
    static readonly LogOff = 1600
    static readonly GameReset = 1700
    static readonly RemoteOn = 1800
    static readonly RemoteOff = 1900

    static readonly Mod = 2000
    static readonly UnMod = 2100
    static readonly Vip = 2200
    static readonly UnVip = 2300
    static readonly Raid = 2400
    static readonly Unraid = 2500

    static readonly Quote = 3000
    static readonly Scale = 3100
    static readonly ChannelTrophy = 3200
    static readonly ChannelTrophyStats = 3300
    static readonly Brightness = 3400
    static readonly RefreshRate = 3500
    static readonly VrViewEye = 3600

    static readonly HelpToDiscord = 4000
    static readonly HelpToChat = 4100
    static readonly Clips = 4200

    static readonly ReloadWidget = 9000
    static readonly UpdateRewards = 9100
    static readonly GameRewardsOn = 9200
    static readonly GameRewardsOff = 9300
    static readonly RefundRedemption = 9400
    static readonly ClearRedemptions = 9500
    static readonly ResetIncrementingEvents = 9600
    static readonly ResetAccumulatingEvents = 9700
}
OptionsMap.addPrototype({
    prototype: OptionSystemActionType,
    description: 'References to system features that are not individual actions.',
})