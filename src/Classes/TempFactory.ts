import {ActionAudio} from '../Objects/Action/ActionAudio.js'
import {IAudioAction, IPipeAction} from '../Interfaces/iactions.js'
import Utils from './Utils.js'
import {TKeys} from '../_data/!keys.js'
import {EnumSystemActionType} from '../Enums/SystemActionType.js'
import {ActionPipe} from '../Objects/Action/ActionPipe.js'
import {EnumEntryUsage} from '../Enums/EntryType.js'

export default class TempFactory {
    static configAudio(audioConfig: ActionAudio): IAudioAction {
        const audio = audioConfig as IAudioAction
        Utils.applyEntryType(Utils.ensureArray(audio.srcEntries), audioConfig.srcEntries_use)
        return audio
    }

    static pipeActionInterface(actionInterface: IPipeAction): ActionPipe {
        const action = new ActionPipe()
        action.preset = actionInterface.config ?? 0
        action.imageDataEntries = Utils.ensureArray(actionInterface.imageDataEntries) ?? []
        action.imagePathEntries = Utils.ensureArray(actionInterface.imagePathEntries) ?? []
        action.imageDataEntries_use = TempFactory.arrayType(Utils.ensureArray(actionInterface.imageDataEntries)?.__type ?? 0)
        action.imagePathEntries_use = TempFactory.arrayType(Utils.ensureArray(actionInterface.imagePathEntries)?.__type ?? 0)
        action.texts = Utils.ensureArray(actionInterface.texts)
        action.durationMs = actionInterface.durationMs
        return action
    }

    static arrayType(type: number): number {
        switch(type) {
            case 0: return EnumEntryUsage.All.valueOf()
            case 1: return EnumEntryUsage.OneRandom.valueOf()
            case 2: return EnumEntryUsage.AllRandom.valueOf()
            case 3: return EnumEntryUsage.OneSpecific.valueOf()
        }
        return EnumEntryUsage.All.valueOf()
    }

    static keyToActionCallbackEnum(key: TKeys): number {
        switch(key) {
            case 'Chat': return EnumSystemActionType.Chat
            case 'ChatOn': return EnumSystemActionType.ChatOn
            case 'ChatOff': return EnumSystemActionType.ChatOff
            case 'PingOn': return EnumSystemActionType.PingOn
            case 'PingOff': return EnumSystemActionType.PingOff
            case 'Mod': return EnumSystemActionType.Mod
            case 'UnMod': return EnumSystemActionType.UnMod
            case 'Vip': return EnumSystemActionType.Vip
            case 'UnVip': return EnumSystemActionType.UnVip
            case 'Quote': return EnumSystemActionType.Quote
            case 'LogOn': return EnumSystemActionType.LogOn
            case 'LogOff': return EnumSystemActionType.LogOff
            case 'Scale': return EnumSystemActionType.Scale
            case 'Brightness': return EnumSystemActionType.Brightness
            case 'RefreshRate': return EnumSystemActionType.RefreshRate
            case 'VrViewEye': return EnumSystemActionType.VrViewEye
            case 'UpdateRewards': return EnumSystemActionType.UpdateRewards
            case 'GameRewardsOn': return EnumSystemActionType.GameRewardsOn
            case 'GameRewardsOff': return EnumSystemActionType.GameRewardsOff
            case 'RefundRedemption': return EnumSystemActionType.RefundRedemption
            case 'ClearRedemptions': return EnumSystemActionType.ClearRedemptions
            case 'ChannelTrophy': return EnumSystemActionType.ChannelTrophy
            case 'ResetIncrementingEvents': return EnumSystemActionType.ResetIncrementingEvents
            case 'ResetAccumulatingEvents': return EnumSystemActionType.ResetAccumulatingEvents
            case 'ReloadWidget': return EnumSystemActionType.ReloadWidget
            case 'ChannelTrophyStats': return EnumSystemActionType.ChannelTrophyStats
            case 'GameReset': return EnumSystemActionType.GameReset
            case 'RemoteOn': return EnumSystemActionType.RemoteOn
            case 'RemoteOff': return EnumSystemActionType.RemoteOff
            case 'HelpToDiscord': return EnumSystemActionType.HelpToDiscord
            case 'HelpToChat': return EnumSystemActionType.HelpToChat
            case 'Clips': return EnumSystemActionType.Clips
            case 'Raid': return EnumSystemActionType.Raid
            case 'Unraid': return EnumSystemActionType.Unraid
        }
        return 0
    }
}