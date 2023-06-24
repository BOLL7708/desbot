import {ActionAudio} from './Action/ActionAudio.js'
import BaseDataObject from './BaseDataObject.js'
import {ActionChat} from './Action/ActionChat.js'
import {ActionCustom} from './Action/ActionCustom.js'
import {ActionDiscord} from './Action/ActionDiscord.js'
import {ActionInput, ActionInputCommand} from './Action/ActionInput.js'
import {ActionLabel} from './Action/ActionLabel.js'
import {ActionLink} from './Action/ActionLink.js'
import {ActionMoveVRSpace} from './Action/ActionMoveVRSpace.js'
import {ActionOBS, ActionOBSFilter, ActionOBSSource} from './Action/ActionOBS.js'
import {ActionPhilipsHuePlug} from './Action/ActionPhilipsHuePlug.js'
import {ActionPhilipsHueBulb} from './Action/ActionPhilipsHueBulb.js'
import {ActionPipe} from './Action/ActionPipe.js'
import {ActionRemoteCommand} from './Action/ActionRemoteCommand.js'
import {ActionScreenshot} from './Action/ActionScreenshot.js'
import {ActionSettingTTS} from './Action/ActionSettingTTS.js'
import {ActionSettingVR} from './Action/ActionSettingVR.js'
import {ActionSign} from './Action/ActionSign.js'
import {ActionSpeech} from './Action/ActionSpeech.js'
import {
    ActionSystem,
    ActionSystemRewardState,
    ActionSystemRewardStateForEvent,
    ActionSystemToggle,
    ActionSystemTrigger
} from './Action/ActionSystem.js'
import {ActionWhisper} from './Action/ActionWhisper.js'
import {ConfigCleanText} from './Config/CleanText.js'
import {
    ConfigController, ConfigControllerChannelTrophyNumber,
    ConfigControllerChannelTrophySettings,
    ConfigControllerStateDefaults,
    ConfigControllerWebsocketsUsed
} from './Config/Controller.js'
import {ConfigDiscord} from './Config/Discord.js'
import {ConfigEditor, ConfigEditorFavorite} from './Config/Editor.js'
import {ConfigExample, ConfigExampleSub} from './Config/Example.js'
import {ConfigImageEditorFontSettings, ConfigImageEditorOutline, ConfigImageEditorRect} from './Config/ImageEditor.js'
import ConfigOBS, {ConfigOBSEventGroups} from './Config/OBS.js'
import {ConfigOpenVR2WS} from './Config/OpenVR2WS.js'
import {ConfigPhilipsHue} from './Config/PhilipsHue.js'
import {
    ConfigPipe,
    ConfigPipeCustomMessage,
    ConfigPipeCustomMessageAvatar,
    ConfigPipeCustomMessageName
} from './Config/Pipe.js'
import {ConfigRelay} from './Config/Relay.js'
import ConfigScreenshots, {ConfigScreenshotsCallback} from './Config/Screenshots.js'
import {ConfigSign} from './Config/Sign.js'
import {ConfigSpeech, ConfigSpeechDictionary, ConfigSpeechWordToAudio} from './Config/Speech.js'
import {ConfigSteam} from './Config/Steam.js'
import ConfigTwitch, {
    ConfigTwitchAnnounceCheer,
    ConfigTwitchAnnounceRaid, ConfigTwitchAnnouncerTriggers,
    ConfigTwitchAnnounceSub, ConfigTwitchCategoryOverride
} from './Config/Twitch.js'
import ConfigTwitchChat from './Config/TwitchChat.js'
import {EventDefault} from './Event/EventDefault.js'
import {PresetDiscordWebhook} from './Preset/DiscordWebhook.js'
import {PresetOBSScene, PresetOBSSource} from './Preset/OBS.js'
import {PresetPermissions} from './Preset/Permissions.js'
import {PresetPhilipsHueColor} from './Preset/PhilipsHue.js'
import {
    PresetPipeBasic,
    PresetPipeCustom,
    PresetPipeCustomAnimation,
    PresetPipeCustomFollow, PresetPipeCustomProperties, PresetPipeCustomTextArea,
    PresetPipeCustomTransition
} from './Preset/Pipe.js'
import {PresetReward} from './Preset/Reward.js'
import {PresetSystemActionText} from './Preset/SystemActionText.js'
import {PresetText} from './Preset/Text.js'
import {TriggerCheer} from './Trigger/TriggerCheer.js'
import {TriggerCommand} from './Trigger/TriggerCommand.js'
import {TriggerRelay} from './Trigger/TriggerRelay.js'
import {TriggerRemoteCommand} from './Trigger/TriggerRemoteCommand.js'
import {TriggerReward} from './Trigger/TriggerReward.js'
import {TriggerTimer} from './Trigger/TriggerTimer.js'
import {SettingChannelTrophyStat} from './Setting/Channel.js'
import {SettingCounterBase} from './Setting/Counters.js'
import {SettingDictionaryEntry} from './Setting/Dictionary.js'
import {SettingSteamAchievements, SettingSteamGame} from './Setting/Steam.js'
import {
    SettingTwitchClient,
    SettingTwitchClip,
    SettingTwitchRedemption,
    SettingTwitchReward,
    SettingTwitchTokens
} from './Setting/Twitch.js'
import {
    SettingUser,
    SettingUserCheer,
    SettingUserMute,
    SettingUserName, SettingUserRaid,
    SettingUserSub,
    SettingUserVoice
} from './Setting/User.js'
import {SettingStreamQuote} from './Setting/Stream.js'

export default class RegisterObjects {
    static register() {
        const objects: BaseDataObject[] = [
            new ActionAudio(),
            new ActionChat(),
            new ActionCustom(),
            new ActionDiscord(),
            new ActionInput(),
            new ActionInputCommand(),
            new ActionLabel(),
            new ActionLink(),
            new ActionMoveVRSpace(),
            new ActionOBS(),
            new ActionOBSSource(),
            new ActionOBSFilter(),
            new ActionPhilipsHueBulb(),
            new ActionPhilipsHuePlug(),
            new ActionPipe(),
            new ActionRemoteCommand(),
            new ActionScreenshot(),
            new ActionSettingTTS(),
            new ActionSettingVR(),
            new ActionSign(),
            new ActionSpeech(),
            new ActionSystem(),
            new ActionSystemTrigger(),
            new ActionSystemToggle(),
            new ActionSystemRewardState(),
            new ActionSystemRewardStateForEvent(),
            new ActionWhisper(),

            new ConfigCleanText(),
            new ConfigController(),
            new ConfigControllerStateDefaults(),
            new ConfigControllerWebsocketsUsed(),
            new ConfigControllerChannelTrophySettings(),
            new ConfigControllerChannelTrophyNumber(),
            new ConfigDiscord(),
            new ConfigEditor(),
            new ConfigEditorFavorite(),
            new ConfigExample(),
            new ConfigExampleSub(),
            new ConfigImageEditorRect(),
            new ConfigImageEditorFontSettings(),
            new ConfigImageEditorOutline(),
            new ConfigOBS(),
            new ConfigOBSEventGroups(),
            new ConfigOpenVR2WS(),
            new ConfigPhilipsHue(),
            new ConfigPipe(),
            new ConfigPipeCustomMessage(),
            new ConfigPipeCustomMessageAvatar(),
            new ConfigPipeCustomMessageName(),
            new ConfigRelay(),
            new ConfigScreenshots(),
            new ConfigScreenshotsCallback(),
            new ConfigSign(),
            new ConfigSpeech(),
            new ConfigSpeechDictionary(),
            new ConfigSpeechWordToAudio(),
            new ConfigSteam(),
            new ConfigTwitch(),
            new ConfigTwitchAnnouncerTriggers(),
            new ConfigTwitchAnnounceSub(),
            new ConfigTwitchAnnounceCheer(),
            new ConfigTwitchAnnounceRaid(),
            new ConfigTwitchCategoryOverride(),
            new ConfigTwitchChat(),

            new EventDefault(),

            new PresetDiscordWebhook(),
            new PresetOBSScene(),
            new PresetOBSSource(),
            new PresetPermissions(),
            new PresetPhilipsHueColor(),
            new PresetPipeBasic(),
            new PresetPipeCustom(),
            new PresetPipeCustomFollow(),
            new PresetPipeCustomAnimation(),
            new PresetPipeCustomTransition(),
            new PresetPipeCustomProperties(),
            new PresetPipeCustomTextArea(),
            new PresetReward(),
            new PresetSystemActionText(),
            new PresetText(),

            new SettingChannelTrophyStat(),
            new SettingCounterBase(),
            new SettingDictionaryEntry(),
            new SettingSteamGame(),
            new SettingSteamAchievements(),
            new SettingStreamQuote(),
            new SettingTwitchTokens(),
            new SettingTwitchClient(),
            new SettingTwitchRedemption(),
            new SettingTwitchClip(),
            new SettingTwitchReward(),
            new SettingUser(),
            new SettingUserName(),
            new SettingUserMute(),
            new SettingUserCheer(),
            new SettingUserSub(),
            new SettingUserVoice(),
            new SettingUserRaid(),

            new TriggerCheer(),
            new TriggerCommand(),
            new TriggerRelay(),
            new TriggerRemoteCommand(),
            new TriggerReward(),
            new TriggerTimer()
        ]

        for(const obj of objects) {
            console.log('Registering', obj.constructor.name)
            obj.register()
        }
    }
}