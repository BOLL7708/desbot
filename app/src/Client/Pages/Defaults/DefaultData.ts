import {PresetPermissions} from '../../../Shared/Objects/Data/Preset/PresetPermissions.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import {PresetReward} from '../../../Shared/Objects/Data/Preset/PresetReward.js'
import {PresetDiscordWebhook} from '../../../Shared/Objects/Data/Preset/PresetDiscordWebhook.js'
import {OptionSystemActionType} from '../../../Shared/Objects/Options/OptionSystemActionType.js'
import {PresetSystemActionText} from '../../../Shared/Objects/Data/Preset/PresetSystemActionText.js'
import {PresetPhilipsHueBulbState} from '../../../Shared/Objects/Data/Preset/PresetPhilipsHue.js'
import {PresetEventCategory} from '../../../Shared/Objects/Data/Preset/PresetEventCategory.js'
import {EventActionContainer, EventDefault} from '../../../Shared/Objects/Data/Event/EventDefault.js'
import {TriggerCommand} from '../../../Shared/Objects/Data/Trigger/TriggerCommand.js'
import OptionCommandCategory from '../../../Shared/Objects/Options/OptionCommandCategory.js'
import {OptionTTSFunctionType} from '../../../Shared/Objects/Options/OptionTTS.js'
import {TriggerReward} from '../../../Shared/Objects/Data/Trigger/TriggerReward.js'
import {OptionTwitchRewardVisible} from '../../../Shared/Objects/Options/OptionTwitch.js'
import {PresetOBSScene, PresetOBSSource} from '../../../Shared/Objects/Data/Preset/PresetOBS.js'
import AbstractData from '../../../Shared/Objects/Data/AbstractData.js'
import Utils, {EUtilsTitleReturnOption} from '../../../Shared/Utils/Utils.js'
import ActionSettingTTS from '../../../Shared/Objects/Data/Action/ActionSettingTTS.js'
import ActionSpeech from '../../../Shared/Objects/Data/Action/ActionSpeech.js'
import ActionChat from '../../../Shared/Objects/Data/Action/ActionChat.js'
import ActionSystem, {ActionSystemRewardStateForEvent} from '../../../Shared/Objects/Data/Action/ActionSystem.js'
import ActionAudio from '../../../Shared/Objects/Data/Action/ActionAudio.js'
import ActionLabel from '../../../Shared/Objects/Data/Action/ActionLabel.js'
import ActionDiscord from '../../../Shared/Objects/Data/Action/ActionDiscord.js'
import ActionSign from '../../../Shared/Objects/Data/Action/ActionSign.js'
import ActionOBS, {ActionOBSSource} from '../../../Shared/Objects/Data/Action/ActionOBS.js'
import ActionURI from '../../../Shared/Objects/Data/Action/ActionURI.js'

export enum EKeys {
    // region Presets
    PermissionsStreamer = '1 Streamer',
    PermissionsModerators = '2 Moderators',
    PermissionsVIPs = '3 VIPs',
    PermissionsSubscribers = '4 Subscribers',
    PermissionsEveryone = '5 Everyone',

    RewardSpeak = 'Speak',
    RewardSetVoice = 'Set Voice',
    // RewardChannelTrophy = 'Channel Trophy',

    PhilipsHueColorWhite = 'White',
    PhilipsHueColorRed = 'Red',
    PhilipsHueColorOrange = 'Orange',
    PhilipsHueColorButtercup = 'Buttercup',
    PhilipsHueColorYellow = 'Yellow',
    PhilipsHueColorLime = 'Lime',
    PhilipsHueColorGreen = 'Green',
    PhilipsHueColorTurquoise = 'Turquoise',
    PhilipsHueColorCyan = 'Cyan',
    PhilipsHueColorSky = 'Sky',
    PhilipsHueColorBlue = 'Blue',
    PhilipsHueColorPurple = 'Purple',
    PhilipsHueColorPink = 'Pink',

    // DiscordChannelTrophy = 'Channel Trophy',
    // DiscordChannelTrophyStats = 'Channel Trophy Statistics',
    DiscordClips = 'Clips',
    DiscordHelp = 'Help',
    DiscordTodo = 'ToDo',
    DiscordAchievements = 'Achievements',
    DiscordChat = 'Chat Log',
    DiscordWhisperCommands = 'Whisper Commands',
    DiscordScreenshots = 'Screenshots',

    EventCategoryUser = 'User',
    EventCategoryDefaultImports = 'Default Imports',
    EventCategoryBonusImports = 'Bonus Imports',
    EventCategoryBOLL = 'BOLL',
    // endregion

    // region Events
    TtsOn = 'Default TTS On',
    TtsOff = 'Default TTS Off',
    TtsSilence = 'Default TTS Silence',
    TtsDie = 'Default TTS Die',
    TtsNick = 'Default TTS Nick',
    TtsClearNick = 'Default TTS Clear Nick',
    TtsMute = 'Default TTS Mute',
    TtsUnmute = 'Default TTS Unmute',
    TtsGender = 'Default TTS Gender',
    TtsSpeak = 'Default TTS Speak',
    TtsSay = 'Default TTS Say',
    TtsSetVoice = 'Default TTS Set Voice',
    TtsGetNick = 'Default TTS Get Nick',
    TtsGetVoice = 'Default TTS Get Voice',
    TtsVoices = 'Default TTS Voices',
    DictionarySetWord = 'Default Dictionary Set Word',
    DictionaryGetWord = 'Default Dictionary Get Word',
    DictionaryClearWord = 'Default Dictionary Clear Word',

    SystemChat = 'Default Chat',
    SystemChatOn = 'Default Chat On',
    SystemChatOff = 'Default Chat Off',
    SystemPingOn = 'Default Ping On',
    SystemPingOff = 'Default Ping Off',
    SystemLogOn = 'Default Log On',
    SystemLogOff = 'Default Log Off',
    SystemGameReset = 'Default Game Reset',
    SystemRemoteOn = 'Default Remote On',
    SystemRemoteOff = 'Default Remote Off',
    SystemMod = 'Default Mod',
    SystemUnMod = 'Default UnMod',
    SystemVip = 'Default VIP',
    SystemUnVip = 'Default UnVIP',
    SystemRaid = 'Default Raid',
    SystemUnraid = 'Default Unraid',
    SystemQuote = 'Default Quote',
    SystemScale = 'Default Scale',
    // SystemChannelTrophy = 'Default Channel Trophy',
    // SystemChannelTrophyStats = 'Default Channel Trophy Stats',
    SystemHelpToDiscord = 'Default Help to Discord',
    SystemHelpToChat = 'Default Help to Chat',
    SystemClips = 'Default Clips',
    SystemReloadWidget = 'Default Reload Widget',
    SystemUpdateRewards = 'Default Update Rewards',
    SystemGameRewardsOn = 'Default Game Rewards On',
    SystemGameRewardsOff = 'Default Game Rewards Off',
    SystemRefundRedemption = 'Default Refund Redemption',
    SystemClearRedemptions = 'Default Clear Redemptions',
    SystemResetIncrementingEvents = 'Default Reset Incrementing Events',
    SystemResetAccumulatingEvents = 'Default Reset Accumulating Events',

    CustomGame = 'Bonus Game',
    CustomAudioURL = 'Bonus Audio URL',
    CustomSay = 'Bonus Say',
    CustomLurk = 'Bonus Lurk',
    CustomLabel = 'Bonus Label',
    CustomTodo = 'Bonus ToDo',
    CustomShoutOut = 'Bonus ShoutOut',
    CustomEndStream = 'Bonus End Stream',
    CustomQuestionsAdd = 'Bonus Question Add',
    CustomQuestionsClear = 'Bonus Question Clear',

    LinkBot = 'Bonus Link Bot Website',
    LinkBotIssues = 'Bonus Link Bot Issues',

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
                    instance.VIPs = false
                    instance.subscribers = false
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
                    instance.VIPs = false
                    instance.subscribers = false
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
                    instance.VIPs = true
                    instance.subscribers = false
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
                    instance.VIPs = true
                    instance.subscribers = true
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
                    instance.VIPs = true
                    instance.subscribers = true
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
            }
            // ,
            // {
            //     key: EKeys.RewardChannelTrophy,
            //     instance: new PresetReward(),
            //     importer: async (instance: PresetReward, key)=>{
            //         instance.title = '🏆 Held by nobody!'
            //         instance.cost = 1
            //         instance.prompt = 'Become the Channel Trophy holder! You hold 🏆 until someone else pays the ever increasing (+1) price!'
            //         instance.background_color = '#000000'
            //         instance.is_max_per_stream_enabled = true
            //         instance.max_per_stream = 10000
            //         instance.is_global_cooldown_enabled = true
            //         instance.global_cooldown_seconds = 1
            //         return await DataBaseHelper.save(instance, key)
            //     }
            // }
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
            // {
            //     key: OptionSystemActionType.ChannelTrophyStats.valueOf(),
            //     instance: new PresetSystemActionText(),
            //     importer: async (instance: PresetSystemActionText, key: string) => {
            //         instance.speech = [
            //             'Initiating posting all Channel Trophy statistics',
            //             'Completed posting all Channel Trophy statistics',
            //             'Initiating posting of Channel Trophy statistics',
            //             'Completed posting of Channel Trophy statistics',
            //             'Failed to post Channel Trophy statistics'
            //         ]
            //         return await DataBaseHelper.save(instance, key)
            //     }
            // },
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
                        'Finished updating %updated rewards, skipped %skipped, failed %failed.'
                    ]
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        philipsHueBulbColorPresets: [
            {
                key: EKeys.PhilipsHueColorWhite,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.saturation = 0
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorRed,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 0
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorOrange,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 4*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorButtercup,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 8*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorYellow,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 12*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorLime,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 16*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorGreen,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 20*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorTurquoise,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 30*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorCyan,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 36*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorSky,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 40*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorBlue,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 44*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorPurple,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 48*1024
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PhilipsHueColorPink,
                instance: new PresetPhilipsHueBulbState(),
                importer: async (instance: PresetPhilipsHueBulbState, key: string) => {
                    instance.hue = 56*1024
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        eventCategoryPresets: [
            {
                key: EKeys.EventCategoryUser,
                instance: new PresetEventCategory(),
                importer: async (instance: PresetEventCategory, key: string) => {
                    instance.description = 'Events created by the user.'
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.EventCategoryDefaultImports,
                instance: new PresetEventCategory(),
                importer: async (instance: PresetEventCategory, key: string) => {
                    instance.description = 'Events imported as defaults.'
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.EventCategoryBonusImports,
                instance: new PresetEventCategory(),
                importer: async (instance: PresetEventCategory, key: string) => {
                    instance.description = 'Events imported as bonuses.'
                    return await DataBaseHelper.save(instance, key)
                }
            },
            // {
            //     key: EKeys.EventCategoryBOLL,
            //     instance: new PresetEventCategory(),
            //     importer: async (instance: PresetEventCategory, key: string) => {
            //         instance.description = 'Events imported as tests.'
            //         return await DataBaseHelper.save(instance, key)
            //     }
            // }
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
                    trigger.entries = ['silence', 'stop']
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
                    trigger.entries = ['die', 'ttsdie', 'kill']
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
                    trigger.entries = ['nick', 'setnick', 'name', 'setname']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag', 'nick']
                    trigger.helpText = 'Set the TTS nick name for the tagged user, skip the tag to set your own, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsClearNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['clearnick', 'clearname']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Resets the TTS nick name for the tagged user, skip the tag to reset your own, available for, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.ClearUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsMute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['mute']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag', 'reason text']
                    trigger.helpText = 'Mutes the tagged user so they will not speak with TTS, persists, reason is optional.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserDisabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%targetTag has lost their voice.']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsUnmute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['unmute']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Unmutes the tagged user so they can again speak with TTS.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%targetTag has regained their voice.']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsGender,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['gender']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag', 'f|m']
                    trigger.helpText = 'Swap the TTS voice gender for the tagged user, skip the tag to swap your own, available for VIPs & subs, optionally specify a gender.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%targetOrUserTag now sounds like this']
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsSpeak,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerReward()
                    trigger.rewardEntries = [await DefaultData.loadID(new PresetReward(), EKeys.RewardSpeak)]
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)

                    const action = new ActionSpeech()
                    action.entries = ['%userInput']
                    action.voiceOfUser_orUsername = '%userLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['say']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['message']
                    trigger.helpText = 'Speaks a message with TTS without announcing any user.'

                    const action = new ActionSpeech()
                    action.entries = ['%userInput']
                    action.voiceOfUser_orUsername = '%userLogin'

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const triggerReward = new TriggerReward()
                    triggerReward.rewardEntries = [await DefaultData.loadID(new PresetReward(), EKeys.RewardSetVoice)]
                    triggerReward.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const triggerCommand = new TriggerCommand()
                    triggerCommand.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    triggerCommand.entries = ['voice', 'setvoice']
                    triggerCommand.category = OptionCommandCategory.TTS
                    triggerCommand.helpInput = ['usertag', 'voice text']
                    triggerCommand.helpText = 'Set the TTS voice for the tagged user, skip the tag to set your own.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetUserVoice
                    const actionChat = new ActionChat()
                    actionChat.entries = ['TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice']
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%targetOrUserTag now sounds like this.']
                    actionSpeech.voiceOfUser_orUsername = '%targetOrUserLogin'

                    return await DefaultData.registerEvent(instance, key,
                        [triggerReward, triggerCommand],
                        [actionTTS, actionChat, actionSpeech]
                    )
                }
            },{
                key: EKeys.TtsGetNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['getnick']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Get the current TTS nick name for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetUserNick
                    const actionChat = new ActionChat()
                    actionChat.entries = ['TTS: "%lastTTSSetNickLogin" is called "%lastTTSSetNickSubstitute"']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionChat])
                }
            },{
                key: EKeys.TtsGetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['getvoice']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Get the current TTS voice for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetUserVoice
                    const actionChat = new ActionChat()
                    actionChat.entries = ['TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionChat])
                }
            },{
                key: EKeys.TtsVoices,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['tts', 'voices']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Posts information about how to set your voice.'
                    trigger.userCooldown = 60 * 5

                    const action = new ActionChat()
                    action.entries = ['Preview Google TTS voices here, pick a Wavenet or Neural2 voice (standard is banned) and use the name with the "Set Your Voice" reward 👉 https://cloud.google.com/text-to-speech/docs/voices']

                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['ttson']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Turn ON global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.Enable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['TTS enabled.']
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultData.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = OptionTwitchRewardVisible.Hidden
                    actionSystem.toggle.rewardStatesForEvents = [rewardState]

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },{
                key: EKeys.TtsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['ttsoff']
                    trigger.category = OptionCommandCategory.TTS
                    trigger.helpText = 'Turn OFF global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.Disable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['TTS disabled.']
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardStateForEvent()
                    rewardState.event = await DefaultData.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.event_visible = OptionTwitchRewardVisible.Visible
                    actionSystem.toggle.rewardStatesForEvents = [rewardState]

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
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['word', 'setword']
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpInput = ['original', 'replacement']
                    trigger.helpText = 'Adds a word to the dictionary, comma separated replacement will randomize, prepend original with + to append or - to remove.'
                    trigger.requireMinimumWordCount = 2

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%lastDictionaryWord is now said as %lastDictionarySubstitute']
                    actionSpeech.skipDictionary = true

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.DictionaryGetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['getword']
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpText = 'Gets the current value for a dictionary entry, available for everyone.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.GetDictionaryEntry
                    const actionChat = new ActionChat()
                    actionChat.entries = ['Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"']

                    return await DefaultData.registerEvent(instance, key, [trigger], [actionTTS, actionChat])
                }
            },{
                key: EKeys.DictionaryClearWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['clearword']
                    trigger.requireExactWordCount = 1
                    trigger.category = OptionCommandCategory.Dictionary
                    trigger.helpText = 'Clears a dictionary entry so it is no longer substituted.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = OptionTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['%lastDictionaryWord was cleared from the dictionary']
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
                    trigger.entries = ['chat']
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpInput = ['message']
                    trigger.helpText = 'Displays an anonymous text message as a VR overlay, available for VIPs.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Chat]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['chaton']
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns ON the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ChatOn]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChatOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['chatoff']
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns OFF the chat popups in VR.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ChatOff]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['pingon']
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns ON the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.PingOn]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemPingOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['pingoff']
                    trigger.category = OptionCommandCategory.Chat
                    trigger.helpText = 'Turns OFF the sound effect for messages if TTS is off or the message would be silent.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.PingOff]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['logon']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Turns ON the logging of chat messages to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.LogOn]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemLogOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['logoff']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Turns OFF the logging of chat messages to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.LogOff]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemQuote,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['quote']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['usertag', 'quote text']
                    trigger.helpText = 'Save a quote by the tagger user, or if the tag is skipped, the streamer.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Quote]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemScale,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['scale']
                    trigger.category = OptionCommandCategory.SteamVR
                    trigger.helpInput = ['world scale|start scale', 'end scale', 'minutes']
                    trigger.helpText = 'Sets the world scale for the running VR game and cancels any sequence, range is 10-1000%, provide 3 numbers to start a sequence (from, to, minutes), no value resets to default.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Scale]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUpdateRewards,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['update']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Updates rewards on Twitch.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.UpdateRewards]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['rewardson']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Turn ON game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.GameRewardsOn]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameRewardsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['rewardsoff']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Turn OFF game specific rewards.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.GameRewardsOff]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRefundRedemption,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['refund']
                    trigger.helpInput = ['usertag']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Refund the last reward in the redemptions queue for the tagged user.'
                    trigger.globalCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.RefundRedemption]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClearRedemptions,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['clearqueue']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Clears the queue of unprotected redemptions.'
                    trigger.globalCooldown = 60
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ClearRedemptions]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetIncrementingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['resetinc']
                    trigger.globalCooldown = 20
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets all incrementing events.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ResetIncrementingEvents]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemResetAccumulatingEvents,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['resetacc']
                    trigger.globalCooldown = 20
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets all accumulating events.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ResetAccumulatingEvents]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemReloadWidget,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['reload']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Reloads the widget.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ReloadWidget]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemClips,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['clips']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Posts new Twitch clips to Discord.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Clips]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemGameReset,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['nogame']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Resets the detected Steam game.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.GameReset]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },

            {
                key: EKeys.SystemRaid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['raid']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpInput = ['usertag|channel link']
                    trigger.helpText = 'Will initiate a raid if a valid user tag or channel link is provided.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Raid]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnraid,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['unraid']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Will cancel the currently active raid.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Unraid]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['remoteon']
                    trigger.category = OptionCommandCategory.System
                    trigger.helpText = 'Turn ON remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.RemoteOn]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemRemoteOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['remoteoff']
                    trigger.category = OptionCommandCategory.System
                    trigger.helpText = 'Turn OFF remote channel commands.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.RemoteOff]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemHelpToDiscord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['posthelp']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Posts help information to Discord.'
                    const actionSystem = new ActionSystem()
                    actionSystem.trigger.systemActionEntries = [OptionSystemActionType.HelpToDiscord]
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Help was posted to Discord']
                    return await DefaultData.registerEvent(instance, key, [trigger], [actionSystem, actionSpeech])
                }
            },
            {
                key: EKeys.SystemHelpToChat,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['help']
                    trigger.category = OptionCommandCategory.System
                    trigger.helpInput = ['command']
                    trigger.helpText = 'Posts help information about specific commands. Come on now, this is the help! Why even ask about help about the help! Sheesh!'
                    trigger.userCooldown = 30
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.HelpToChat]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['mod']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Mod a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Mod]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnMod,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['unmod']
                    trigger.category = OptionCommandCategory.Admin
                    trigger.helpText = 'Unmod a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.UnMod]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['vip']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Grant VIP for a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.Vip]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemUnVip,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['unvip']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpText = 'Remove VIP from a user.'
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.UnVip]
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
                    trigger.rewardEntries = [await DefaultData.loadID(new PresetReward(), EKeys.RewardChannelTrophy)]
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.ChannelTrophy]
                    return await DefaultData.registerEvent(instance, key, [trigger], [action])
                }
            },
            {
                key: EKeys.SystemChannelTrophyStats,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['trophy']
                    const action = new ActionSystem()
                    action.trigger.systemActionEntries = [OptionSystemActionType.GameReset]
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
                    trigger.entries = ['game']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpText = 'Post information about the current game to chat.'
                    trigger.globalCooldown = 3*60
                    const actionSign = new ActionSign()
                    actionSign.title = 'Current Game'
                    actionSign.imageSrc = '%gameBanner'
                    actionSign.subtitle = '%gameName\n%gamePrice'
                    actionSign.durationMs = 10000
                    const actionChat = new ActionChat()
                    actionChat.entries = ['Game: %gameName - Released: %gameRelease - Price: %gamePrice - Link: %gameLink']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionSign, actionChat],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomAudioURL,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['audiourl']
                    trigger.category = OptionCommandCategory.Misc
                    trigger.helpInput = ['audio url']
                    trigger.helpText = 'Will play back the audio from the URL, for streamers by default as it\'s a risky command.'
                    const action = new ActionAudio()
                    action.srcEntries = ['%userInput']
                    action.volume = 0.5
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries = ['say']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Will read the message aloud, without saying from whom, available for VIPs.'
                    const action = new ActionSpeech()
                    action.entries = ['%userInput']
                    // TODO: Can be set to have the voice of a specific account.
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomLurk,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['lurk']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['message text']
                    trigger.helpText = 'Posts a lurk message, available for everyone.'
                    const action = new ActionChat()
                    action.entries = ['📢 For some reason %userTag felt it necessary to publicly announce that they are in ultra lurk mode! 🤗 %userInput']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomLabel,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['label', 'txt']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['label contents']
                    trigger.helpText = 'Sets the text of the on-screen bottom label.'
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Label set to "%userInput"']
                    const actionLabel = new ActionLabel()
                    actionLabel.fileName = 'obs_info_label.txt'
                    actionLabel.textEntries = ['%userInput']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionSpeech, actionLabel],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomTodo,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['todo']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['todo text']
                    trigger.helpText = 'Posts a to-do note in the to-do Discord channel.'
                    const actionDiscord = new ActionDiscord()
                    actionDiscord.entries = ['👉 %userInput']
                    actionDiscord.webhook = await DefaultData.loadID(new PresetDiscordWebhook(), EKeys.DiscordTodo)
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['To do list appended with: %userInput']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionDiscord, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomShoutOut,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['so', 'shoutout']
                    trigger.category = OptionCommandCategory.Twitch
                    trigger.helpInput = ['usertag']
                    trigger.helpText = 'Posts a shout-out message for a user, useful for an incoming raider.'
                    trigger.globalCooldown = 30
                    trigger.requireUserTag = true
                    const action = new ActionChat()
                    action.entries = ['📢 People gather around and feast your eyes on ❤%targetTag❤ who last streamed "%targetGame", give them your unwanted attention! 🥰 (check out their channel and consider following! 🤣 %targetLink)']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomEndStream,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsStreamer)
                    trigger.entries = ['endstream']
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
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomQuestionsAdd,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key) => {
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['q', 'question']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpInput = ['question']
                    trigger.helpText = 'Adds a question to questions.txt'
                    const actionLabel = new ActionLabel()
                    actionLabel.fileName = 'questions.txt'
                    actionLabel.textEntries = ['%nowDateTime %userName : %userInput']
                    actionLabel.append = true
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Question added.']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionLabel, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.CustomQuestionsClear,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key) => {
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['qc', 'questionsclear']
                    trigger.category = OptionCommandCategory.Utility
                    trigger.helpText = 'Clears everything from questions.txt'
                    const actionLabel = new ActionLabel()
                    actionLabel.fileName = 'questions.txt'
                    actionLabel.textEntries = ['']
                    actionLabel.append = false
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Questions cleared.']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionLabel, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            }
        ],
        links: [
            {
                key: EKeys.LinkBot,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['bot', 'desbot']
                    trigger.category = OptionCommandCategory.Links
                    trigger.helpText = 'Posts a link to the bot website.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Read about the bot here: https://desbot.app']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
                }
            },
            {
                key: EKeys.LinkBotIssues,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['issue', 'issues', 'bug', 'bugs']
                    trigger.category = OptionCommandCategory.Links
                    trigger.helpText = 'Posts a link to the issues page for the bot.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Post feedback and bugs for the bot here: https://desbot.app/issues']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBonusImports)
                    )
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
                    trigger.entries = ['camon']
                    trigger.helpText = 'Turns ON the room camera.'
                    const actionOBSSource = new ActionOBSSource()
                    actionOBSSource.scenePreset = await DataBaseHelper.loadID(PresetOBSScene.ref.build(), EKeys.BollPresetMainScene)
                    actionOBSSource.sourcePreset = await DataBaseHelper.loadID(PresetOBSSource.ref.build(), EKeys.BollPresetCameraSource)
                    const actionOBS = new ActionOBS()
                    actionOBS.sourceEntries = [actionOBSSource]
                    actionOBS.state = false
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Camera enabled']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionOBS, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollCommandCameraOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['camoff']
                    trigger.helpText = 'Turns OFF the room camera.'
                    const actionOBSSource = new ActionOBSSource()
                    actionOBSSource.scenePreset = await DataBaseHelper.loadID(PresetOBSScene.ref.build(), EKeys.BollPresetMainScene)
                    actionOBSSource.sourcePreset = await DataBaseHelper.loadID(PresetOBSSource.ref.build(), EKeys.BollPresetCameraSource)
                    const actionOBS = new ActionOBS()
                    actionOBS.sourceEntries = [actionOBSSource]
                    actionOBS.state = true
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Camera disabled']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionOBS, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollCommandScaleOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['scaleon']
                    trigger.helpText = 'Turns ON all world scale rewards.'
                    // TODO: Need to also add the scale events.
                    const actionSystem = new ActionSystem()
                    actionSystem.toggle.rewardStatesForEvents.push(
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleGrow, true),
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleShrink, true)
                    )
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Scale rewards enabled.']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionSystem, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                )
                }
            },
            {
                key: EKeys.BollCommandScaleOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['scaleoff']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Turns OFF all world scale rewards.'

                    // TODO: Need to also add the scale events.
                    const actionSystem = new ActionSystem()
                    actionSystem.toggle.rewardStatesForEvents.push(
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleGrow, false),
                        await DefaultData.buildToggleForEvent(EKeys.BollRewardScaleShrink, false)
                    )

                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Scale rewards disabled.']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionSystem, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollCommandLivCam,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries = ['livcam']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpInput = ['number']
                    trigger.helpText = 'Switch the LIV camera profile.'
                    const actionURI = new ActionURI()
                    actionURI.entries = ['liv-app://camera/set/%inputNumber']
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries = ['Liv camera set to %inputNumber']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [actionURI, actionSpeech],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
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
                    trigger.entries = ['discord']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to the official Discord server.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Official Discord server 👉 https://discord.com/invite/CTj47pmxuT']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollLinkSnack,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['snack']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to Haupt Lakrits, where the snack has been procured from.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Snacks procured from Haupt Lakrits 👉 https://www.lakrits.com/']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollLinkGithub,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['github']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to my main Github page.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Github, where I keep my SteamVR and other projects 👉 https://github.com/BOLL7708']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollLinkTwitter,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['twitter']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to my Twitter page.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Twitter, mostly complaints to companies 👉 https://twitter.com/BOLL7708']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            },
            {
                key: EKeys.BollLinkArchive,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultData.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries = ['archive', 'youtube', 'yt']
                    trigger.category = OptionCommandCategory.Custom
                    trigger.helpText = 'Posts a link to the YouTube stream archive.'
                    trigger.globalCooldown = 60 * 5
                    const action = new ActionChat()
                    action.entries = ['Stream archive on YouTube 👉 https://youtube.com/playlist?list=PLPpKs-9QAC4UVZZMUsOEM7Ye9cYebvYda']
                    return await DefaultData.registerEvent(
                        instance, key, [trigger], [action],
                        await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryBOLL)
                    )
                }
            }
        ],
    }

    static async loadID<T>(instance: T&AbstractData, key: string): Promise<number> {
        return await DataBaseHelper.loadID(instance.constructor.name, key)
    }
    static async saveSubAndGetID<T>(instance: T&AbstractData, key: string, parentId: number = 0): Promise<number> {
        const subKey = this.buildKey(instance, key)
        return await this.saveAndGetID(instance, subKey, parentId)
    }
    static async saveAndGetID<T>(instance: T&AbstractData, key: string, parentId: number = 0): Promise<number> {
        await DataBaseHelper.save(instance, key, undefined, parentId)
        return await DataBaseHelper.loadID(instance.constructor.name, key)
    }
    static buildKey<T>(instance: T&AbstractData, key: string): string {
        return `${key} ${Utils.camelToTitle(instance.constructor.name, EUtilsTitleReturnOption.SkipFirstWord)}`
    }
    static async registerEvent(
        instance: EventDefault,
        key: string,
        triggers: AbstractData[],
        actions: AbstractData[],
        category: number = 0
    ): Promise<string|undefined> {
        if(category == 0) category = await DefaultData.loadID(new PresetEventCategory(), EKeys.EventCategoryDefaultImports)
        instance.category = category
        const parentId = await DefaultData.saveAndGetID(instance, key)
        if(parentId > 0) {
            for(const trigger of triggers) {
                if(Array.isArray(instance.triggers)) instance.triggers.push(await DefaultData.saveSubAndGetID(trigger, key, parentId))
                else console.warn('EventDefault.triggers is not an array')
            }
            const actionContainer = new EventActionContainer()
            for(const action of actions) {
                if(Array.isArray(actionContainer.entries)) actionContainer.entries.push(await DefaultData.saveSubAndGetID(action, key, parentId))
                else console.warn('EventActionContainer.entries is not an array')
            }
            instance.actions = [actionContainer]
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
    instance: AbstractData
    importer: IDefaultObjectImporter<any>
    parentKey?: string
    parentClass?: string
}
export type IDefaultObjectImporter<T extends AbstractData> = (item: T, key: string) => Promise<string|undefined>