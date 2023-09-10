import {ActionAudio} from './Action/ActionAudio.js'
import Data from './Data.js'
import {ActionChat} from './Action/ActionChat.js'
import {ActionCustom} from './Action/ActionCustom.js'
import {ActionDiscord} from './Action/ActionDiscord.js'
import {ActionInput, ActionInputCommand} from './Action/ActionInput.js'
import {ActionLabel} from './Action/ActionLabel.js'
import {ActionURI} from './Action/ActionURI.js'
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
import {ConfigCleanText} from './Config/ConfigCleanText.js'
import {
    ConfigController,
    ConfigControllerChannelTrophyNumber,
    ConfigControllerChannelTrophySettings,
    ConfigControllerStateDefaults,
    ConfigControllerWebsocketsUsed
} from './Config/ConfigController.js'
import {ConfigDiscord} from './Config/ConfigDiscord.js'
import {ConfigEditor, ConfigEditorFavorite} from './Config/ConfigEditor.js'
import {ConfigExample, ConfigExampleSub} from './Config/ConfigExample.js'
import {
    ConfigImageEditorFontSettings,
    ConfigImageEditorOutline,
    ConfigImageEditorRect
} from './Config/ConfigImageEditor.js'
import ConfigOBS from './Config/ConfigOBS.js'
import {ConfigOpenVR2WS} from './Config/ConfigOpenVR2WS.js'
import {ConfigPhilipsHue} from './Config/ConfigPhilipsHue.js'
import {
    ConfigPipe,
    ConfigPipeCustomMessage,
    ConfigPipeCustomMessageAvatar,
    ConfigPipeCustomMessageName
} from './Config/ConfigPipe.js'
import {ConfigRelay} from './Config/ConfigRelay.js'
import ConfigScreenshots, {ConfigScreenshotsCallback} from './Config/ConfigScreenshots.js'
import {ConfigSign} from './Config/ConfigSign.js'
import {ConfigSpeech, ConfigSpeechDictionary, ConfigSpeechWordToAudio} from './Config/ConfigSpeech.js'
import {ConfigSteam} from './Config/ConfigSteam.js'
import ConfigTwitch, {ConfigTwitchCategoryOverride} from './Config/ConfigTwitch.js'
import ConfigChat from './Config/ConfigChat.js'
import {
    EventActionContainer,
    EventBehaviorOptions,
    EventDefault,
    EventOptions,
    EventRewardOptions
} from './Event/EventDefault.js'
import {PresetDiscordWebhook} from './Preset/PresetDiscordWebhook.js'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from './Preset/PresetOBS.js'
import {PresetPermissions} from './Preset/PresetPermissions.js'
import {PresetPhilipsHueBulb, PresetPhilipsHueBulbState, PresetPhilipsHuePlug} from './Preset/PresetPhilipsHue.js'
import {
    PresetPipeBasic,
    PresetPipeCustom,
    PresetPipeCustomAnimation,
    PresetPipeCustomFollow,
    PresetPipeCustomProperties,
    PresetPipeCustomTextArea,
    PresetPipeCustomTransition
} from './Preset/PresetPipe.js'
import {PresetReward} from './Preset/PresetReward.js'
import {PresetSystemActionText} from './Preset/PresetSystemActionText.js'
import {PresetText} from './Preset/PresetText.js'
import {TriggerCheer} from './Trigger/TriggerCheer.js'
import {TriggerCommand} from './Trigger/TriggerCommand.js'
import {TriggerRelay} from './Trigger/TriggerRelay.js'
import {TriggerRemoteCommand} from './Trigger/TriggerRemoteCommand.js'
import {TriggerReward} from './Trigger/TriggerReward.js'
import {TriggerTimer} from './Trigger/TriggerTimer.js'
import {SettingChannelTrophyStat} from './Setting/SettingChannel.js'
import {SettingCounterBase} from './Setting/SettingCounters.js'
import {SettingDictionaryEntry} from './Setting/SettingDictionary.js'
import {SettingSteamAchievements, SettingSteamGame} from './Setting/SettingSteam.js'
import {
    SettingTwitchClient,
    SettingTwitchClip,
    SettingTwitchRedemption,
    SettingTwitchReward,
    SettingTwitchTokens
} from './Setting/SettingTwitch.js'
import {
    SettingUser,
    SettingUserCheer,
    SettingUserMute,
    SettingUserName,
    SettingUserRaid,
    SettingUserSub,
    SettingUserVoice
} from './Setting/SettingUser.js'
import {SettingStreamQuote} from './Setting/SettingStream.js'
import ConfigAnnouncements, {
    ConfigAnnounceCheer,
    ConfigAnnounceRaid,
    ConfigAnnouncerTriggers,
    ConfigAnnounceSub
} from './Config/ConfigAnnouncements.js'
import ConfigCommands from './Config/ConfigCommands.js'
import {ConfigTest} from './Config/ConfigTest.js'

/**
 * This class exists to enlist the things stored in the database in a map.
 * The map is then used to re-instantiate these classes when retrieved from the database.
 * If a class is not enlisted here, it will not be re-instantiated, and thus throw an error.
 */
export default class EnlistData {
    static run() {
        const objects: Data[] = [
            new ActionAudio(),
            new ActionChat(),
            new ActionCustom(),
            new ActionDiscord(),
            new ActionInput(),
            new ActionInputCommand(),
            new ActionLabel(),
            new ActionURI(),
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

            new ConfigAnnounceCheer(),
            new ConfigAnnounceRaid(),
            new ConfigAnnounceSub(),
            new ConfigAnnouncements(),
            new ConfigAnnouncerTriggers(),
            new ConfigChat(),
            new ConfigCleanText(),
            new ConfigCommands(),
            new ConfigController(),
            new ConfigControllerChannelTrophyNumber(),
            new ConfigControllerChannelTrophySettings(),
            new ConfigControllerStateDefaults(),
            new ConfigControllerWebsocketsUsed(),
            new ConfigDiscord(),
            new ConfigEditor(),
            new ConfigEditorFavorite(),
            new ConfigExample(),
            new ConfigExampleSub(),
            new ConfigImageEditorFontSettings(),
            new ConfigImageEditorOutline(),
            new ConfigImageEditorRect(),
            new ConfigOBS(),
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
            new ConfigTwitchCategoryOverride(),
            new ConfigTest(),

            new EventDefault(),
            new EventOptions(),
            new EventActionContainer(),
            new EventBehaviorOptions(),
            new EventRewardOptions(),

            new PresetDiscordWebhook(),
            new PresetOBSScene(),
            new PresetOBSSource(),
            new PresetOBSFilter(),
            new PresetPermissions(),
            new PresetPhilipsHueBulbState(),
            new PresetPhilipsHueBulb(),
            new PresetPhilipsHuePlug(),
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
            obj.enlist()
        }
    }
}