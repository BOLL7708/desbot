import {ActionAudio} from '../Objects/Action/ActionAudio.js'
import {IAudioAction} from '../Interfaces/iactions.js'
import Utils from './Utils.js'
import {TKeys} from '../_data/!keys.js'
import {OptionSystemActionType} from '../Options/OptionSystemActionType.js'
import {OptionEntryUsage} from '../Options/OptionEntryType.js'

export default class TempFactory {
    static configAudio(audioConfig: ActionAudio): IAudioAction {
        const audio = audioConfig as IAudioAction
        Utils.applyEntryType(Utils.ensureArray(audio.srcEntries), audioConfig.srcEntries_use)
        return audio
    }

    static arrayType(type: number): number {
        switch(type) {
            case 0: return OptionEntryUsage.All.valueOf()
            case 1: return OptionEntryUsage.OneRandom.valueOf()
            case 2: return OptionEntryUsage.AllRandom.valueOf()
            case 3: return OptionEntryUsage.OneSpecific.valueOf()
        }
        return OptionEntryUsage.All.valueOf()
    }

    static keyToActionCallbackEnum(key: TKeys): number {
        switch(key) {
            case 'Chat': return OptionSystemActionType.Chat
            case 'ChatOn': return OptionSystemActionType.ChatOn
            case 'ChatOff': return OptionSystemActionType.ChatOff
            case 'PingOn': return OptionSystemActionType.PingOn
            case 'PingOff': return OptionSystemActionType.PingOff
            case 'Mod': return OptionSystemActionType.Mod
            case 'UnMod': return OptionSystemActionType.UnMod
            case 'Vip': return OptionSystemActionType.Vip
            case 'UnVip': return OptionSystemActionType.UnVip
            case 'Quote': return OptionSystemActionType.Quote
            case 'LogOn': return OptionSystemActionType.LogOn
            case 'LogOff': return OptionSystemActionType.LogOff
            case 'Scale': return OptionSystemActionType.Scale
            case 'Brightness': return OptionSystemActionType.Brightness
            case 'RefreshRate': return OptionSystemActionType.RefreshRate
            case 'VrViewEye': return OptionSystemActionType.VrViewEye
            case 'UpdateRewards': return OptionSystemActionType.UpdateRewards
            case 'GameRewardsOn': return OptionSystemActionType.GameRewardsOn
            case 'GameRewardsOff': return OptionSystemActionType.GameRewardsOff
            case 'RefundRedemption': return OptionSystemActionType.RefundRedemption
            case 'ClearRedemptions': return OptionSystemActionType.ClearRedemptions
            case 'ChannelTrophy': return OptionSystemActionType.ChannelTrophy
            case 'ResetIncrementingEvents': return OptionSystemActionType.ResetIncrementingEvents
            case 'ResetAccumulatingEvents': return OptionSystemActionType.ResetAccumulatingEvents
            case 'ReloadWidget': return OptionSystemActionType.ReloadWidget
            case 'ChannelTrophyStats': return OptionSystemActionType.ChannelTrophyStats
            case 'GameReset': return OptionSystemActionType.GameReset
            case 'RemoteOn': return OptionSystemActionType.RemoteOn
            case 'RemoteOff': return OptionSystemActionType.RemoteOff
            case 'HelpToDiscord': return OptionSystemActionType.HelpToDiscord
            case 'HelpToChat': return OptionSystemActionType.HelpToChat
            case 'Clips': return OptionSystemActionType.Clips
            case 'Raid': return OptionSystemActionType.Raid
            case 'Unraid': return OptionSystemActionType.Unraid
        }
        return 0
    }
}