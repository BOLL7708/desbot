import BaseDataObject from '../../Objects/BaseDataObject.js'
import {PresetPermissions} from '../../Objects/Preset/Permissions.js'
import {EventActionContainer, EventDefault} from '../../Objects/Event/EventDefault.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {TriggerCommand} from '../../Objects/Trigger/TriggerCommand.js'
import {ActionSettingTTS} from '../../Objects/Action/ActionSettingTTS.js'
import {EnumTTSFunctionType} from '../../Enums/TTS.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import {ActionSpeech} from '../../Objects/Action/ActionSpeech.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {ActionChat} from '../../Objects/Action/ActionChat.js'
import {PresetReward} from '../../Objects/Preset/Reward.js'
import {
    ActionSystem,
    ActionSystemRewardState,
    ActionSystemRewardStateForEvent
} from '../../Objects/Action/ActionSystem.js'
import {EnumTwitchRewardUsable, EnumTwitchRewardVisible} from '../../Enums/Twitch.js'
import {EnumSystemActionType} from '../../Enums/SystemActionType.js'
import {ActionSign} from '../../Objects/Action/ActionSign.js'
import {ActionAudio} from '../../Objects/Action/ActionAudio.js'
import {ActionLabel} from '../../Objects/Action/ActionLabel.js'
import {ActionDiscord} from '../../Objects/Action/ActionDiscord.js'
import {PresetDiscordWebhook} from '../../Objects/Preset/DiscordWebhook.js'
import {PresetSystemActionText} from '../../Objects/Preset/SystemActionText.js'

enum EKeys {
    // region Presets
    PermissionsStreamer = '1 Streamer',
    PermissionsModerators = '2 Moderators',
    PermissionsSubscribers = '3 Subscribers',
    PermissionsVIPs = '4 VIPs',
    PermissionsEveryone = '5 Everyone',

    RewardSpeak = 'Reward Speak',
    RewardSetVoice = 'Reward Set Voice',
    RewardChannelTrophy = 'Reward Channel Trophy',

    DiscordChannelTrophy = 'Discord Channel Trophy',
    DiscordChannelTrophyStats = 'Discord Channel Trophy',
    DiscordClips = 'Discord Clips',
    DiscordHelp = 'Discord Help',
    DiscordTodo = 'Discord ToDo',
    DiscordAchievements = 'Discord Achievements',
    DiscordChat = 'Discord Chat',
    DiscordWhisperCommands = 'Discord Whisper Commands',
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
    TtsSetVoice = 'Command & Reward TTS Set Voice',
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

    BollCameraOn = 'Command Camera On',
    BollCameraOff = 'Command Camera Off',
    BollLivCam = 'Command Set LIV Camera',
    BollScaleOn = 'Command Scale On',
    BollScaleOff = 'Command Scale Off',

    // endregion
}

export default class DefaultObjects {
    /**
     * TODO:
     *  1. A list of objects
     *  2. Loop over list
     *  3. Create object form list
     *  4. Fill object with data from template
     *  5. Loop over template properties
     *  6. If template property is a reference, create that reference and return the ID.
     *
     */
    /*
        {
            category: [
                {
                    key: string
                    builder()
                }
            ]
        }
     */
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
            {
                key: EKeys.DiscordChannelTrophy,
                instance: new PresetDiscordWebhook(),
                importer: async (instance: PresetDiscordWebhook, key)=>{
                    return await DataBaseHelper.save(instance, key)
                }
            },
        ],
        systemActionTextPresets: [
            {
                key: EnumSystemActionType.Scale.valueOf(),
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
                key: EnumSystemActionType.ChannelTrophyStats.valueOf(),
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
                key: EnumSystemActionType.Clips.valueOf(),
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
                key: EnumSystemActionType.ClearRedemptions.valueOf(),
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
                key: EnumSystemActionType.ResetIncrementingEvents.valueOf(),
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
                key: EnumSystemActionType.ResetAccumulatingEvents.valueOf(),
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
                key: EnumSystemActionType.Quote.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Added a quote by %targetOrUserTag']
                    instance.chat = ['%targetTag said: "%text" (on: %date, game: %gameName)']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.GameReset.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Currently running Steam game has been reset.']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.ChatOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.ChatOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.PingOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat ping enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.PingOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Chat ping disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.LogOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Logging enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.LogOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Logging disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.Brightness.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Headset brightness set to %value%']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.RefreshRate.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Headset refresh rate set to %value hertz']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.VrViewEye.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Output eye mode changed to %value']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.GameRewardsOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Game specific rewards enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.GameRewardsOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Game specific rewards disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.RemoteOn.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Remote commands enabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.RemoteOff.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.speech = ['Remote commands disabled']
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.Mod.valueOf(),
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
                key: EnumSystemActionType.UnMod.valueOf(),
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
                key: EnumSystemActionType.Vip.valueOf(),
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
                key: EnumSystemActionType.UnVip.valueOf(),
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
                key: EnumSystemActionType.RefundRedemption.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.chat = [
                        '%targetTag was refunded: %cost x boll7708meat',
                        'Failed to refund %targetTag anything.',
                        '%targetTag has nothing to refund!'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EnumSystemActionType.Raid.valueOf(),
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
                key: EnumSystemActionType.Unraid.valueOf(),
                instance: new PresetSystemActionText(),
                importer: async (instance: PresetSystemActionText, key: string) => {
                    instance.chat = [
                        'Raid cancelled.',
                        'Could not cancel raid.'
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
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('silence', 'stop')
                    trigger.helpText = 'Silence the current speaking TTS entry.'

                    const action = new ActionSettingTTS()
                    action.functionType = EnumTTSFunctionType.StopCurrent

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsDie,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('die', 'ttsdie', 'kill')
                    trigger.helpText = 'Empties the queue and silences what is currently spoken.'

                    const action= new ActionSettingTTS()
                    action.functionType = EnumTTSFunctionType.StopAll

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.requireMinimumWordCount = 1
                    trigger.entries.push('nick', 'setnick', 'name', 'setname')
                    trigger.helpInput.push('usertag', 'nick')
                    trigger.helpText = 'Set the TTS nick name for the tagged user, skip the tag to set your own, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsClearNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('clearnick', 'clearname')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Resets the TTS nick name for the tagged user, skip the tag to reset your own, available for, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.ClearUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsMute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('mute')
                    trigger.helpInput.push('usertag', 'reason text')
                    trigger.helpText = 'Mutes the tagged user so they will not speak with TTS, persists, reason is optional.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserDisabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has lost their voice.')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsUnmute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unmute')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Unmutes the tagged user so they can again speak with TTS.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has regained their voice.')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsGender,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('gender')
                    trigger.helpInput.push('usertag', 'f|m')
                    trigger.helpText = 'Swap the TTS voice gender for the tagged user, skip the tag to swap your own, available for VIPs & subs, optionally specify a gender.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsSpeak,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerReward()
                    trigger.rewardEntries.push(await DefaultObjects.loadID(new PresetReward(), EKeys.RewardSpeak))
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUsername = '%userLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('say')
                    trigger.helpInput.push('message')
                    trigger.helpText = 'Speaks a message with TTS without announcing any user.'

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUsername = '%userLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const triggerReward = new TriggerReward()
                    triggerReward.rewardEntries.push(await DefaultObjects.loadID(new PresetReward(), EKeys.RewardSetVoice))
                    triggerReward.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const triggerCommand = new TriggerCommand()
                    triggerCommand.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    triggerCommand.entries.push('voice', 'setvoice')
                    triggerCommand.helpInput.push('usertag', 'voice text')
                    triggerCommand.helpText = 'Set the TTS voice for the tagged user, skip the tag to set your own.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key,
                        [triggerReward, triggerCommand],
                        [actionTTS, actionSpeech, actionChat]
                    )
                }
            },{
                key: EKeys.TtsGetNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getnick')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS nick name for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsGetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getvoice')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS voice for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsVoices,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('tts', 'voices')
                    trigger.helpText = 'Posts information about how to set your voice.'
                    trigger.userCooldown = 60 * 5

                    const action = new ActionChat()
                    action.entries.push('Preview Google TTS voices here, pick a Wavenet or Neural2 voice (standard is banned) and use the name with the "Set Your Voice" reward 👉 https://cloud.google.com/text-to-speech/docs/voices')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttson')
                    trigger.helpTitle = 'Text To Speech'
                    trigger.helpText = 'Turn ON global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.Enable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS enabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultObjects.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = EnumTwitchRewardVisible.Disable
                    actionSystem.toggle.rewardStatesForEvents.push(rewardState)

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },{
                key: EKeys.TtsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttsoff')
                    trigger.helpTitle = 'Text To Speech'
                    trigger.helpText = 'Turn OFF global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.Disable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS disabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultObjects.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = EnumTwitchRewardVisible.Enable
                    actionSystem.toggle.rewardStatesForEvents.push(rewardState)

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },
            // endregion

            // region Dictionary
            {
                key: EKeys.DictionarySetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('word', 'setword')
                    trigger.helpInput = ['original', 'replacement']
                    trigger.helpText = 'Adds a word to the dictionary, comma separated replacement will randomize, prepend original with + to append or - to remove.'
                    trigger.requireMinimumWordCount = 2

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord is now said as %lastDictionarySubstitute')
                    actionSpeech.skipDictionary = true

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.DictionaryGetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getword')
                    trigger.helpText = 'Gets the current value for a dictionary entry, available for everyone.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetDictionaryEntry
                    const actionChat = new ActionChat()
                    actionChat.entries.push('Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionChat])
                }
            },{
                key: EKeys.DictionaryClearWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('clearword')
                    trigger.requireExactWordCount = 1
                    trigger.helpText = 'Clears a dictionary entry so it is no longer substituted.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord was cleared from the dictionary')
                    actionSpeech.skipDictionary = true

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionSpeech])
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
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('chat')
                    trigger.helpTitle = 'Chat Stuff'
                    trigger.helpInput = ['message']
                    trigger.helpText = 'Displays an anonymous text message as a VR overlay, available for VIPs.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('chaton')
                    trigger.helpText = 'Turns ON the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('chatoff')
                    trigger.helpText = 'Turns OFF the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('pingon')
                    trigger.helpText = 'Turns ON the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('pingoff')
                    helpText: 'Turns OFF the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('logon')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('logoff')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.LogOff)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemQuote,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('quote')
                    trigger.helpInput = ['usertag', 'quote text']
                    trigger.helpText = 'Save a quote by the tagger user, or if the tag is skipped, the streamer.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Quote)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemScale,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('scale')
                    trigger.helpInput = ['world scale|start scale', 'end scale', 'minutes']
                    trigger.helpText = 'Sets the world scale for the running VR game and cancels any sequence, range is 10-1000%, provide 3 numbers to start a sequence (from, to, minutes), no value resets to default.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Scale)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUpdateRewards,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('update')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.UpdateRewards)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('rewardson')
                    trigger.helpText = 'Turn ON game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.GameRewardsOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('rewardsoff')
                    trigger.helpText = 'Turn OFF game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.GameRewardsOff)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRefundRedemption,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('refund')
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Refund the last reward in the redemptions queue for the tagged user.'
                    trigger.globalCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.RefundRedemption)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClearRedemptions,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('clearqueue')
                    trigger.globalCooldown = 60
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.ClearRedemptions)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetIncrementingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('resetinc')
                    trigger.globalCooldown = 20
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.ResetIncrementingEvents)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetAccumulatingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('resetacc')
                    trigger.globalCooldown = 20
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.ResetAccumulatingEvents)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemReloadWidget,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('reload')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.ReloadWidget)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClips,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('clips')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Clips)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameReset,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('nogame')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.GameReset)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },

            {
                key: EKeys.SystemRaid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('raid')
                    trigger.helpInput = ['usertag|channel link']
                    trigger.helpText = 'Will initiate a raid if a valid user tag or channel link is provided.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Raid)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnraid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('unraid')
                    trigger.helpText = 'Will cancel the currently active raid.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.GameReset)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('remoteon')
                    trigger.helpText = 'Turn ON remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.RemoteOn)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('remoteoff')
                    trigger.helpText = 'Turn OFF remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.RemoteOff)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemHelpToDiscord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('posthelp')
                    const actionSystem = new ActionSystem()
                    actionSystem.trigger.systemActionEntries.push(EnumSystemActionType.HelpToDiscord)
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Help was posted to Discord')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionSystem, actionSpeech])
                }
            },
            {
                key: EKeys.SystemHelpToChat,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('help')
                    trigger.helpInput = ['command'],
                    trigger.helpText = 'Posts help information about specific commands. Come on now, this is the help! Why even ask about help about the help! Sheesh!',
                    trigger.userCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.HelpToChat)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('mod')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Mod)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('unmod')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.UnMod)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('vip')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.Vip)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unvip')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.UnVip)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChannelTrophy,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    instance.options.rewardIgnoreUpdateCommand = true
                    const trigger = new TriggerReward()
                    trigger.rewardEntries.push(await DefaultObjects.loadID(new PresetReward(), EKeys.RewardChannelTrophy))
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.ChannelTrophy)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChannelTrophyStats,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('trophy')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(EnumSystemActionType.GameReset)
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            }
        ]
    }
    static readonly BONUS_ENTRIES: IDefaultObjectList = {
        customEvents: [
            {
                key: EKeys.CustomGame,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('game')
                    trigger.helpText = 'Post information about the current game to chat.'
                    trigger.globalCooldown = 3*60
                    const actionSign = new ActionSign()
                    actionSign.title = 'Current Game'
                    actionSign.imageSrc = '%gameBanner'
                    actionSign.subtitle = '%gameName\n%gamePrice'
                    actionSign.durationMs = 10000
                    const actionChat = new ActionChat()
                    actionChat.entries.push('Game: %gameName - Released: %gameRelease - Price: %gamePrice - Link: %gameLink')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionSign, actionChat])
                }
            },
            {
                key: EKeys.CustomAudioURL,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('audiourl')
                    trigger.helpInput = ['audio url']
                    trigger.helpText = 'Will play back the audio from the URL, for streamers by default as it\'s a risky command.'
                    const action = new ActionAudio()
                    action.srcEntries.push('%userInput')
                    action.volume = 0.5
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.CustomSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('say')
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Will read the message aloud, without saying from whom, available for VIPs.'
                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    // TODO: Can be set to have the voice of a specific account.
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.CustomLurk,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('lurk')
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Posts a lurk message, available for everyone.'
                    const action = new ActionChat()
                    action.entries.push('📢 For some reason %userTag felt it necessary to publicly announce that they are in ultra lurk mode! 🤗 %userInput')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.CustomLabel,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('label', 'txt')
                    trigger.helpInput = ['label contents']
                    trigger.helpText = 'Sets the text of the on-screen bottom label.'
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('Label set to "%userInput"')
                    const actionLabel = new ActionLabel()
                    actionLabel.fileName = 'obs_info_label.txt'
                    actionLabel.textEntries.push('%userInput')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionSpeech, actionLabel])
                }
            },
            {
                key: EKeys.CustomTodo,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('todo')
                    trigger.helpInput = ['todo text']
                    trigger.helpText = 'Posts a to-do note in the to-do Discord channel.'
                    const actionDiscord = new ActionDiscord()
                    actionDiscord.entries.push('👉 %userInput')
                    actionDiscord.webhook = await DefaultObjects.loadID(new PresetDiscordWebhook(), EKeys.DiscordTodo)
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('To do list appended with: %userInput')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionDiscord, actionSpeech])
                }
            },
            {
                key: EKeys.CustomShoutOut,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('so', 'shoutout')
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Posts a shout-out message for a user, useful for an incoming raider.',
                    trigger.globalCooldown = 30
                    trigger.requireUserTag = true
                    const action = new ActionChat()
                    action.entries.push('📢 People gather around and feast your eyes on ❤%targetTag❤ who last streamed "%targetGame", give them your unwanted attention! 🥰 (check out their channel and consider following! 🤣 %targetLink)')
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.CustomEndStream,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries.push('endstream')
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries.push(
                        EnumSystemActionType.ChannelTrophyStats,
                        EnumSystemActionType.Clips,
                        EnumSystemActionType.ClearRedemptions,
                        EnumSystemActionType.ResetIncrementingEvents,
                        EnumSystemActionType.ResetAccumulatingEvents
                    )
                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            }
        ]
    }

    static async loadID<T>(instance: T&BaseDataObject, key: string): Promise<number> {
        const item = await DataBaseHelper.loadItem(instance, key)
        return item?.id ?? 0
    }
    static async saveSubAndGetID<T>(instance: T&BaseDataObject, key: string, parentId: number = 0): Promise<number> {
        const subKey = this.buildKey(instance, key)
        return await this.saveAndGetID(instance, subKey, parentId)
    }
    static async saveAndGetID<T>(instance: T&BaseDataObject, key: string, parentId: number = 0): Promise<number> {
        await DataBaseHelper.save(instance, key, undefined, parentId)
        const item = await DataBaseHelper.loadItem(instance, key)
        return item?.id ?? 0
    }
    static buildKey<T>(instance: T&BaseDataObject, key: string): string {
        return `${key} ${Utils.camelToTitle(instance.constructor.name, EUtilsTitleReturnOption.SkipFirstWord)}`
    }
    static async registerEvent(
        instance: EventDefault,
        key: string,
        triggers: BaseDataObject[],
        actions: BaseDataObject[]
    ): Promise<boolean> {
        const parentId = await DefaultObjects.saveAndGetID(instance, key)
        if(parentId > 0) {
            for(const trigger of triggers) {
                instance.triggers.push(await DefaultObjects.saveSubAndGetID(trigger, key, parentId))
            }
            const actionContainer = new EventActionContainer()
            for(const action of actions) {
                actionContainer.entries.push(await DefaultObjects.saveSubAndGetID(action, key, parentId))
            }
            instance.actions.push(actionContainer)
        }
        return await DataBaseHelper.save(instance, key)
    }
}

export interface IDefaultObjectList {
    [category: string]: IDefaultObject[]
}

export interface IDefaultObject {
    key: EKeys|string|number
    instance: BaseDataObject
    importer: IDefaultObjectImporter<any>
    parentKey?: string
    parentClass?: string
}
export type IDefaultObjectImporter<T extends BaseDataObject> = (item: T, key: string) => Promise<boolean>