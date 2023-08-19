import Data from '../../Objects/Data.js'
import {PresetPermissions} from '../../Objects/Preset/PresetPermissions.js'
import {EventActionContainer, EventDefault} from '../../Objects/Event/EventDefault.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {TriggerCommand} from '../../Objects/Trigger/TriggerCommand.js'
import {ActionSettingTTS} from '../../Objects/Action/ActionSettingTTS.js'
import {OptionTTSFunctionType} from '../../Options/OptionTTS.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import {ActionSpeech} from '../../Objects/Action/ActionSpeech.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {ActionChat} from '../../Objects/Action/ActionChat.js'
import {PresetReward} from '../../Objects/Preset/PresetReward.js'
import {ActionSystem, ActionSystemRewardStateForEvent} from '../../Objects/Action/ActionSystem.js'
import {OptionTwitchRewardVisible} from '../../Options/OptionTwitch.js'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.js'
import {ActionSign} from '../../Objects/Action/ActionSign.js'
import {ActionAudio} from '../../Objects/Action/ActionAudio.js'
import {ActionLabel} from '../../Objects/Action/ActionLabel.js'
import {ActionDiscord} from '../../Objects/Action/ActionDiscord.js'
import {PresetDiscordWebhook} from '../../Objects/Preset/PresetDiscordWebhook.js'
import {PresetSystemActionText} from '../../Objects/Preset/PresetSystemActionText.js'
import {PresetOBSScene, PresetOBSSource} from '../../Objects/Preset/PresetOBS.js'
import {ActionOBS, ActionOBSSource} from '../../Objects/Action/ActionOBS.js'
import {ActionURI} from '../../Objects/Action/ActionURI.js'
import OptionCommandCategory from '../../Options/OptionCommandCategory.js'
import OptionEventType from '../../Options/OptionEventType.js'

enum EKeys {
    // region Presets
    PermissionsStreamer = '1 Streamer',
    PermissionsModerators = '2 Moderators',
    PermissionsSubscribers = '3 Subscribers',
    PermissionsVIPs = '4 VIPs',
    PermissionsEveryone = '5 Everyone',

    RewardSpeak = 'Speak',
    RewardSetVoice = 'Set Voice',
    RewardChannelTrophy = 'Channel Trophy',

    DiscordChannelTrophy = 'Channel Trophy',
    DiscordChannelTrophyStats = 'Channel Trophy Statistics',
    DiscordClips = 'Clips',
    DiscordHelp = 'Help',
    DiscordTodo = 'ToDo',
    DiscordAchievements = 'Achievements',
    DiscordChat = 'Chat Log',
    DiscordWhisperCommands = 'Whisper Commands',
    DiscordScreenshots = 'Screenshots',
    // endregion

    // region Events
    TtsOn = 'Command TTS On',
    TtsOff = 'Command TTS Off',
    TtsSilence = 'Command TTS Silence',
    TtsDie = 'Command TTS Die',
    TtsNick = 'Command TTS Nick',
    TtsClearNick = 'Command TTS Clear Nick',
    TtsMute = 'Command TTS Mute',
    TtsUnmute = 'Command TTS Unmute',
    TtsGender = 'Command TTS Gender',
    TtsSpeak = 'Reward TTS Speak',
    TtsSay = 'Command TTS Say',
    TtsSetVoice = 'Reward & Command TTS Set Voice',
    TtsGetNick = 'Command TTS Get Nick',
    TtsGetVoice = 'Command TTS Get Voice',
    TtsVoices = 'Command TTS Voices',
    DictionarySetWord = 'Command Dictionary Set Word',
    DictionaryGetWord = 'Command Dictionary Get Word',
    DictionaryClearWord = 'Command Dictionary Clear Word',

    SystemChat = 'Command Chat',
    SystemChatOn = 'Command Chat On',
    SystemChatOff = 'Command Chat Off',
    SystemPingOn = 'Command Ping On',
    SystemPingOff = 'Command Ping Off',
    SystemLogOn = 'Command Log On',
    SystemLogOff = 'Command Log Off',
    SystemGameReset = 'Command Game Reset',
    SystemRemoteOn = 'Command Remote On',
    SystemRemoteOff = 'Command Remote Off',
    SystemMod = 'Command Mod',
    SystemUnMod = 'Command UnMod',
    SystemVip = 'Command VIP',
    SystemUnVip = 'Command UnVIP',
    SystemRaid = 'Command Raid',
    SystemUnraid = 'Command Unraid',
    SystemQuote = 'Command Quote',
    SystemScale = 'Command Scale',
    SystemChannelTrophy = 'Reward Channel Trophy',
    SystemChannelTrophyStats = 'Command Channel Trophy Stats',
    SystemHelpToDiscord = 'Command Help to Discord',
    SystemHelpToChat = 'Command Help to Chat',
    SystemClips = 'Command Clips',
    SystemReloadWidget = 'Command Reload Widget',
    SystemUpdateRewards = 'Command Update Rewards',
    SystemGameRewardsOn = 'Command Game Rewards On',
    SystemGameRewardsOff = 'Command Game Rewards Off',
    SystemRefundRedemption = 'Command Refund Redemption',
    SystemClearRedemptions = 'Command Clear Redemptions',
    SystemResetIncrementingEvents = 'Command Reset Incrementing Events',
    SystemResetAccumulatingEvents = 'Command Reset Accumulating Events',

    CustomGame = 'Command Game',
    CustomAudioURL = 'Command Audio URL',
    CustomSay = 'Command Say',
    CustomLurk = 'Command Lurk',
    CustomLabel = 'Command Label',
    CustomTodo = 'Command ToDo',
    CustomShoutOut = 'Command ShoutOut',
    CustomEndStream = 'Command End Stream',

    LinkWidget = 'Command Link Widget',

    // BOLL TODO: Temporary?
    BollPresetMainScene = 'Main',
    BollPresetCameraSource = 'Room Camera',

    BollRewardScaleGrow = 'Reward Scale Grow',
    BollRewardScaleShrink = 'Reward Scale Shrink',
    BollCommandCameraOn = 'Command Camera On',
    BollCommandCameraOff = 'Command Camera Off',
    BollCommandLivCam = 'Command Set LIV Camera',
    BollCommandScaleOn = 'Command Scale On',
    BollCommandScaleOff = 'Command Scale Off',

    BollLinkDiscord = 'Command Link Discord',
    BollLinkSnack = 'Command Link Snack',
    BollLinkGithub = 'Command Link Github',
    BollLinkTwitter = 'Command Link Twitter',
    BollLinkArchive = 'Command Link Archive',
    // endregion
}

export default class DefaultData {
    static readonly PREREQUISITE_ENTRIES: IDefaultObjectList = {
        permissionPresets: [
            {
                key: EKeys.PermissionsStreamer,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = false
                    instance.subscribers = false
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsModerators,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = false
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsSubscribers,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsVIPs,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = true
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsEveryone,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = true
                    instance.everyone = true
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        rewardPresets: [
            {
                key: EKeys.RewardSpeak,
                instance: new PresetReward(),
                importer: async (instance: PresetReward, key)=>{
                    instance.title = '💬 Speak'
                    instance.cost = 5
                    instance.prompt = 'Your message is read aloud.'
                    instance.background_color = '#AAAAAA'
                    instance.is_user_input_required = true
                    instance.should_redemptions_skip_request_queue = true
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.RewardSetVoice,
                instance: new PresetReward(),
                importer: async (instance: PresetReward, key)=>{
                    instance.title = '👄 Set Your Voice'
                    instance.cost = 5
                    instance.prompt = 'Change your speaking voice, see the About section for options.'
                    instance.background_color = '#AAAAAA'
                    instance.is_user_input_required = true
                    instance.should_redemptions_skip_request_queue = true
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.RewardChannelTrophy,
                instance: new PresetReward(),
                importer: async (instance: PresetReward, key)=>{
                    instance.title = '🏆 Held by nobody!'
                    instance.cost = 1
                    instance.prompt = 'Become the Channel Trophy holder! You hold 🏆 until someone else pays the ever increasing (+1) price!'
                    instance.background_color = '#000000'
                    instance.is_max_per_stream_enabled = true
                    instance.max_per_stream = 10000
                    instance.is_global_cooldown_enabled = true
                    instance.global_cooldown_seconds = 1
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        discordPresets: [
            /* TODO
            {
                key: EKeys.DiscordChannelTrophy,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.DiscordChannelTrophyStats,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            */
            {
                key: EKeys.DiscordClips,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            /* TODO
            {
                key: EKeys.DiscordHelp,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            */
            {
                key: EKeys.DiscordTodo,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.DiscordAchievements,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.DiscordChat,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.DiscordWhisperCommands,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.DiscordScreenshots,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        systemActionTextPresets: [
            {
                key: OptionSystemActionType.Scale.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'World scale set to %userNumber%',
                        'World scale will change from %from to %to% over %mins minutes',
                        'World scale sequence finished',
                        'World scale sequence not set',
                        'World scale sequence terminated'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ChannelTrophyStats.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Initiating posting all Channel Trophy statistics',
                        'Completed posting all Channel Trophy statistics',
                        'Initiating posting of Channel Trophy statistics',
                        'Completed posting of Channel Trophy statistics',
                        'Failed to post Channel Trophy statistics'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Clips.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Starting Twitch clip import.',
                        'There are %count1 old clips, %count2 new clips.',
                        'Finished posting %count new clips.'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ClearRedemptions.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Initiating clearing of reward redemptions queue',
                        'Completed clearing %count out of %total in the reward redemptions queue',
                        'There were no reward redemptions in the queue to clear'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ResetIncrementingEvents.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Initiating reset of incremental events',
                        'Finished resetting %reset out of %total incremental events, skipping %skipped'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ResetAccumulatingEvents.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Initiating reset of accumulating events',
                        'Finished resetting %reset out of %total accumulating events, skipping %skipped'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Quote.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Added a quote by %targetOrUserTag']
                    instance.chat = ['%targetTag said: "%text" (on: %date, game: %gameName)']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.GameReset.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Currently running Steam game has been reset.']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ChatOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.ChatOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.PingOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat ping enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.PingOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat ping disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.LogOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Logging enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.LogOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Logging disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Brightness.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Headset brightness set to %value%']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.RefreshRate.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Headset refresh rate set to %value hertz']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.VrViewEye.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Output eye mode changed to %value']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.GameRewardsOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Game specific rewards enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.GameRewardsOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Game specific rewards disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.RemoteOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Remote commands enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.RemoteOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Remote commands disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Mod.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        '%targetNick made moderator',
                        '%targetNick could not be made moderator'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.UnMod.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        '%targetNick removed from moderators',
                        '%targetNick could not be removed from moderators'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Vip.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        '%targetNick made V I P',
                        '%targetNick could not be made V I P'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.UnVip.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        '%targetNick removed from V I Ps',
                        '%targetNick could not be removed from V I Ps'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.RefundRedemption.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.chat = [
                        '%targetTag was refunded: %cost channel points',
                        'Failed to refund %targetTag anything.',
                        '%targetTag has nothing to refund!'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Raid.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.chat = [
                        'Initiating raid on %targetTag, currently playing: %targetGame',
                        'Stream title "%targetTitle", link to avoid preroll: %targetLink',
                        'I could not find channel: "%userInput"'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.Unraid.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.chat = [
                        'Raid cancelled.',
                        'Could not cancel raid.'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: OptionSystemActionType.UpdateRewards.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = [
                        'Updating channel rewards.',
                        'Finished updating %updated, skipped %skipped, failed %failed.'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ]
    }
    static readonly SYSTEM_ENTRIES: IDefaultObjectList = {
        textToSpeechEvents: [
            // region Actions
            {
                key: EKeys.TtsSilence,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('silence', 'stop')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Silence the current speaking TTS entry.'

                    const action = new ActionSettingTTS()
                    action.functionType = OptionTTSFunctionType.StopCurrent

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsDie,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('die', 'ttsdie', 'kill')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Empties the queue and silences what is currently spoken.'

                    const action= new ActionSettingTTS()
                    action.functionType = OptionTTSFunctionType.StopAll

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.requireMinimumWordCount = 1
                    trigger.entries.push('nick', 'setnick', 'name', 'setname')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag', 'nick')
                    trigger.helpText = 'Set the TTS nick name for the tagged user, skip the tag to set your own, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsClearNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('clearnick', 'clearname')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Resets the TTS nick name for the tagged user, skip the tag to reset your own, available for, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.ClearUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsMute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('mute')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag', 'reason text')
                    trigger.helpText = 'Mutes the tagged user so they will not speak with TTS, persists, reason is optional.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserDisabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has lost their voice.')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsUnmute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unmute')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Unmutes the tagged user so they can again speak with TTS.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has regained their voice.')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsGender,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('gender')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag', 'f|m')
                    trigger.helpText = 'Swap the TTS voice gender for the tagged user, skip the tag to swap your own, available for VIPs & subs, optionally specify a gender.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this')
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsSpeak,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerReward()
                    trigger.rewardEntries.push(await DefaultData.loadID(new PresetReward(), EKeys.RewardSpeak))
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUser_orUsername = '%userLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('say')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('message')
                    trigger.helpText = 'Speaks a message with TTS without announcing any user.'

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUser_orUsername = '%userLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const triggerReward = new TriggerReward()
                    triggerReward.rewardEntries.push(await DefaultData.loadID(new PresetReward(), EKeys.RewardSetVoice))
                    triggerReward.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const triggerCommand = new TriggerCommand()
                    triggerCommand.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    triggerCommand.entries.push('voice', 'setvoice')
                    triggerCommand.category = OptionCommandCategory.TTS
                    triggerCommand.helpInput.push('usertag', 'voice text')
                    triggerCommand.helpText = 'Set the TTS voice for the tagged user, skip the tag to set your own.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultData.registerEvent(instance, key,
                        [triggerReward, triggerCommand],
                        [actionTTS, actionSpeech, actionChat]
                    )
                }
            },{
                key: EKeys.TtsGetNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getnick')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS nick name for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsGetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getvoice')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS voice for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsVoices,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('tts', 'voices')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Posts information about how to set your voice.'
                    trigger.userCooldown = 60 * 5

                    const action = new ActionChat()
                    action.entries.push('Preview Google TTS voices here, pick a Wavenet or Neural2 voice (standard is banned) and use the name with the "Set Your Voice" reward 👉 https://cloud.google.com/text-to-speech/docs/voices')

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttson')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Turn ON global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.Enable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS enabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultData.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = OptionTwitchRewardVisible.Hidden
                    actionSystem.toggle.rewardStatesForEvents.push(rewardState)

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },{
                key: EKeys.TtsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttsoff')
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Turn OFF global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.Disable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS disabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultData.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = OptionTwitchRewardVisible.Visible
                    actionSystem.toggle.rewardStatesForEvents.push(rewardState)

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },
            // endregion

            // region Dictionary
            {
                key: EKeys.DictionarySetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('word', 'setword')
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpInput = ['original', 'replacement']
                    trigger.helpText = 'Adds a word to the dictionary, comma separated replacement will randomize, prepend original with + to append or - to remove.'
                    trigger.requireMinimumWordCount = 2

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord is now said as %lastDictionarySubstitute')
                    actionSpeech.skipDictionary = true

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.DictionaryGetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getword')
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpText = 'Gets the current value for a dictionary entry, available for everyone.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetDictionaryEntry
                    const actionChat = new ActionChat()
                    actionChat.entries.push('Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"')

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionChat])
                }
            },{
                key: EKeys.DictionaryClearWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('clearword')
                    trigger.requireExactWordCount = 1
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpText = 'Clears a dictionary entry so it is no longer substituted.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord was cleared from the dictionary')
                    actionSpeech.skipDictionary = true

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSpeech])
                }
            }
            // endregion
        ],
        systemEvents: [
            {
                key: EKeys.SystemChat,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('chat')
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpInput = ['message']
                    trigger.helpText = 'Displays an anonymous text message as a VR overlay, available for VIPs.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Chat)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('chaton')
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns ON the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ChatOn)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('chatoff')
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns OFF the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ChatOff)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('pingon')
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns ON the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.PingOn)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('pingoff')
                    trigger.category = OptionCommandCategory.Chat
                    helpText: 'Turns OFF the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.PingOff)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('logon')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Turns ON the logging of chat messages to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.LogOn)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('logoff')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Turns OFF the logging of chat messages to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.LogOff)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemQuote,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('quote')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['usertag', 'quote text']
                    trigger.helpText = 'Save a quote by the tagger user, or if the tag is skipped, the streamer.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Quote)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemScale,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('scale')
                    trigger.category = OptionCommandCategory.SteamVR
                    trigger.helpInput = ['world scale|start scale', 'end scale', 'minutes']
                    trigger.helpText = 'Sets the world scale for the running VR game and cancels any sequence, range is 10-1000%, provide 3 numbers to start a sequence (from, to, minutes), no value resets to default.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Scale)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUpdateRewards,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('update')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Updates rewards on Twitch.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.UpdateRewards)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('rewardson')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Turn ON game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.GameRewardsOn)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('rewardsoff')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Turn OFF game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.GameRewardsOff)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRefundRedemption,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('refund')
                    trigger.helpInput = ['usertag']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Refund the last reward in the redemptions queue for the tagged user.'
                    trigger.globalCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.RefundRedemption)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClearRedemptions,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('clearqueue')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Clears the queue of unprotected redemptions.'
                    trigger.globalCooldown = 60
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ClearRedemptions)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetIncrementingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('resetinc')
                    trigger.globalCooldown = 20
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets all incrementing events.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ResetIncrementingEvents)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetAccumulatingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('resetacc')
                    trigger.globalCooldown = 20
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets all accumulating events.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ResetAccumulatingEvents)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemReloadWidget,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('reload')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Reloads the widget.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ReloadWidget)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClips,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('clips')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Posts new Twitch clips to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Clips)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameReset,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('nogame')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets the detected Steam game.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.GameReset)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },

            {
                key: EKeys.SystemRaid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('raid')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpInput = ['usertag|channel link']
                    trigger.helpText = 'Will initiate a raid if a valid user tag or channel link is provided.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Raid)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnraid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unraid')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Will cancel the currently active raid.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.GameReset)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('remoteon')
                    trigger.category = OptionCommandCategory.System
                    trigger.helpText = 'Turn ON remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.RemoteOn)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('remoteoff')
                    trigger.category = OptionCommandCategory.System
                    trigger.helpText = 'Turn OFF remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.RemoteOff)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemHelpToDiscord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('posthelp')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Posts help information to Discord.'
                    const actionSystem = new ActionSystem()
                    actionSystem.trigger.systemActionEntries.push(OptionSystemActionType.HelpToDiscord)
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Help was posted to Discord')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSystem, actionSpeech])
                }
            },
            {
                key: EKeys.SystemHelpToChat,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('help')
                    trigger.category = OptionCommandCategory.System
                    trigger.helpInput = ['command'],
                    trigger.helpText = 'Posts help information about specific commands. Come on now, this is the help! Why even ask about help about the help! Sheesh!',
                    trigger.userCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.HelpToChat)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('mod')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Mod a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Mod)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('unmod')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Unmod a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.UnMod)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('vip')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Grant VIP for a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.Vip)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unvip')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Remove VIP from a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.UnVip)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            /* TODO make into a module
            {
                key: EKeys.SystemChannelTrophy,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    instance.options.rewardOptions.ignoreUpdateCommand = true
                    const trigger = new TriggerReward()
                    trigger.rewardEntries.push(await DefaultData.loadID(new PresetReward(), EKeys.RewardChannelTrophy))
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.ChannelTrophy)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChannelTrophyStats,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('trophy')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(OptionSystemActionType.GameReset)
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            }
            */
        ]
    }
    static readonly BONUS_ENTRIES: IDefaultObjectList = {
        customEvents: [
            {
                key: EKeys.CustomGame,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('game')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpText = 'Post information about the current game to chat.'
                    trigger.globalCooldown = 3*60
                    const actionSign = new ActionSign()
                    actionSign.title = 'Current Game'
                    actionSign.imageSrc = '%gameBanner'
                    actionSign.subtitle = '%gameName\n%gamePrice'
                    actionSign.durationMs = 10000
                    const actionChat = new ActionChat()
                    actionChat.entries.push('Game: %gameName - Released: %gameRelease - Price: %gamePrice - Link: %gameLink')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSign, actionChat], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomAudioURL,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('audiourl')
                    trigger.category = OptionCommandCategory.Misc
                    trigger.helpInput = ['audio url']
                    trigger.helpText = 'Will play back the audio from the URL, for streamers by default as it\'s a risky command.'
                    const action = new ActionAudio()
                    action.srcEntries.push('%userInput')
                    action.volume = 0.5
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('say')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Will read the message aloud, without saying from whom, available for VIPs.'
                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    // TODO: Can be set to have the voice of a specific account.
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomLurk,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('lurk')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Posts a lurk message, available for everyone.'
                    const action = new ActionChat()
                    action.entries.push('📢 For some reason %userTag felt it necessary to publicly announce that they are in ultra lurk mode! 🤗 %userInput')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomLabel,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('label', 'txt')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['label contents']
                    trigger.helpText = 'Sets the text of the on-screen bottom label.'
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Label set to "%userInput"')
                    const actionLabel = new ActionLabel()
                    actionLabel.fileName = 'obs_info_label.txt'
                    actionLabel.textEntries.push('%userInput')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSpeech, actionLabel], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomTodo,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('todo')
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['todo text']
                    trigger.helpText = 'Posts a to-do note in the to-do Discord channel.'
                    const actionDiscord = new ActionDiscord()
                    actionDiscord.entries.push('👉 %userInput')
                    actionDiscord.webhook = await DefaultData.loadID(new PresetDiscordWebhook(), EKeys.DiscordTodo)
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('To do list appended with: %userInput')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionDiscord, actionSpeech], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomShoutOut,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('so', 'shoutout')
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Posts a shout-out message for a user, useful for an incoming raider.',
                    trigger.globalCooldown = 30
                    trigger.requireUserTag = true
                    const action = new ActionChat()
                    action.entries.push('📢 People gather around and feast your eyes on ❤%targetTag❤ who last streamed "%targetGame", give them your unwanted attention! 🥰 (check out their channel and consider following! 🤣 %targetLink)')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            },
            {
                key: EKeys.CustomEndStream,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('endstream')
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Will run a range of tasks suitable for after the stream.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(
                        OptionSystemActionType.ChannelTrophyStats,
                        OptionSystemActionType.Clips,
                        OptionSystemActionType.ClearRedemptions,
                        OptionSystemActionType.ResetIncrementingEvents,
                        OptionSystemActionType.ResetAccumulatingEvents
                    )
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            }
        ],
        links: [
            {
                key: EKeys.LinkWidget,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('widget')
                    trigger.category = OptionCommandCategory.Links
                    trigger.helpText = 'Posts a link to the bot Github page.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('I can be yours here 👉 https://github.com/BOLL7708/desbot')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.BonusImport)
                }
            }
        ]
    }

    static readonly BOLL_ENTRIES: IDefaultObjectList = { // TODO: Temporary and specific to BOLL
        presets: [
            {
                key: EKeys.BollPresetMainScene,
                instance: new PresetOBSScene(),
                importer: async (instance: PresetOBSScene, key)=>{
                    instance.sceneName = '- Main Overlay'
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.BollPresetCameraSource,
                instance: new PresetOBSSource(),
                importer: async (instance: PresetOBSSource, key)=>{
                    instance.sourceName = 'CAM Logitech Stream Camera'
                    return await DataBaseHelper.save(instance, key)
                }
            },

        ],
        commands: [
            {
                key: EKeys.BollCommandCameraOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('camon')
                    trigger.helpText = 'Turns ON the room camera.'
                    const actionOBSSource = new ActionOBSSource()
                    actionOBSSource.scenePreset = await DataBaseHelper.loadOrEmpty(new PresetOBSScene(), EKeys.BollPresetMainScene)
                    actionOBSSource.sourcePreset = await DataBaseHelper.loadOrEmpty(new PresetOBSSource(), EKeys.BollPresetCameraSource)
                    const actionOBS = new ActionOBS()
                    actionOBS.sourceEntries.push(actionOBSSource)
                    actionOBS.state = false
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Camera enabled')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionOBS, actionSpeech], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollCommandCameraOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('camoff')
                    trigger.helpText = 'Turns OFF the room camera.'
                    const actionOBSSource = new ActionOBSSource()
                    actionOBSSource.scenePreset = await DataBaseHelper.loadOrEmpty(new PresetOBSScene(), EKeys.BollPresetMainScene)
                    actionOBSSource.sourcePreset = await DataBaseHelper.loadOrEmpty(new PresetOBSSource(), EKeys.BollPresetCameraSource)
                    const actionOBS = new ActionOBS()
                    actionOBS.sourceEntries.push(actionOBSSource)
                    actionOBS.state = true
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Camera disabled')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionOBS, actionSpeech], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollCommandScaleOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('scaleon')
                    trigger.helpText = 'Turns ON all world scale rewards.'
                    // TODO: Need to also add the scale events.
                    const actionSystem = new ActionSystem()
                    actionSystem.toggle.rewardStatesForEvents.push(
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleGrow, true),
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleShrink, true)
                    )
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Scale rewards enabled.')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSystem, actionSpeech], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollCommandScaleOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('scaleoff')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Turns OFF all world scale rewards.'

                    // TODO: Need to also add the scale events.
                    const actionSystem = new ActionSystem()
                    actionSystem.toggle.rewardStatesForEvents.push(
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleGrow, false),
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleShrink, false)
                    )

                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Scale rewards disabled.')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSystem, actionSpeech], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollCommandLivCam,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('livcam')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpInput = ['number']
                    trigger.helpText = 'Switch the LIV camera profile.'
                    const actionURI = new ActionURI()
                    actionURI.entries.push('liv-app://camera/set/%inputNumber')
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Liv camera set to %inputNumber')
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionURI, actionSpeech], OptionEventType.Uncategorized)
                }
            }
        ],
        links: [
            {
                key: EKeys.BollLinkDiscord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('discord')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to the official DiscordUtils server.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('Official DiscordUtils server 👉 https://discord.com/invite/CTj47pmxuT')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollLinkSnack,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('snack')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to Haupt Lakrits, where the snack has been procured from.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('Snacks procured from Haupt Lakrits 👉 https://www.lakrits.com/')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollLinkGithub,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('github')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to my main Github page.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('Snacks procured from Haupt Lakrits 👉 https://www.lakrits.com/')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollLinkTwitter,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('twitter')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to my Twitter page.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('Twitter, mostly complaints to companies 👉 https://twitter.com/BOLL7708')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.Uncategorized)
                }
            },
            {
                key: EKeys.BollLinkArchive,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('archive', 'youtube', 'yt')
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to the YouTube stream archive.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries.push('Stream archive on YouTube 👉 https://youtube.com/playlist?list=PLPpKs-9QAC4UVZZMUsOEM7Ye9cYebvYda')
                    return await DefaultData.registerEvent(instance, key, [trigger], [action], OptionEventType.Uncategorized)
                }
            }
        ],
    }

    static async loadID<T>(instance: T&Data, key: string): Promise<number> {
        return await DataBaseHelper.loadID(instance.constructor.name, key)
    }
    static async saveSubAndGetID<T>(instance: T&Data, key: string, parentId: number = 0): Promise<number> {
        const subKey = this.buildKey(instance, key)
        return await this.saveAndGetID(instance, subKey, parentId)
    }
    static async saveAndGetID<T>(instance: T&Data, key: string, parentId: number = 0): Promise<number> {
        await DataBaseHelper.save(instance, key, undefined, parentId)
        return await DataBaseHelper.loadID(instance.constructor.name, key)
    }
    static buildKey<T>(instance: T&Data, key: string): string {
        return `${key} ${Utils.camelToTitle(instance.constructor.name, EUtilsTitleReturnOption.SkipFirstWord)}`
    }
    static async registerEvent(
        instance: EventDefault,
        key: string,
        triggers: Data[],
        actions: Data[],
        type: number = OptionEventType.DefaultImport
    ): Promise<string|undefined> {
        instance.type = type
        const parentId = await DefaultData.saveAndGetID(instance, key)
        if(parentId > 0) {
            for(const trigger of triggers) {
                instance.triggers.push(await DefaultData.saveSubAndGetID(trigger, key, parentId))
            }
            const actionContainer = new EventActionContainer()
            for(const action of actions) {
                actionContainer.entries.push(await DefaultData.saveSubAndGetID(action, key, parentId))
            }
            instance.actions.push(actionContainer)
        }
        return await DataBaseHelper.save(instance, key)
    }

    static async buildToggleForEvent(eventKey: EKeys, visible: boolean): Promise<ActionSystemRewardStateForEvent> {
        const actionSystemEvent = new ActionSystemRewardStateForEvent()
        actionSystemEvent.event = await DefaultData.loadID(new EventDefault(), eventKey)
        actionSystemEvent.event_visible = visible ? OptionTwitchRewardVisible.Visible : OptionTwitchRewardVisible.Hidden
        return actionSystemEvent
    }
}

export interface IDefaultObjectList {
    [category: string]: IDefaultObject[]
}

export interface IDefaultObject {
    key: EKeys|string|number
    instance: Data
    importer: IDefaultObjectImporter<any>
    parentKey?: string
    parentClass?: string
}
export type IDefaultObjectImporter<T extends Data> = (item: T, key: string) => Promise<string|undefined>