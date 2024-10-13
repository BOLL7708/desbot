import {AbstractData} from './AbstractData.mts'
import {ActionAudio} from './Action/ActionAudio.mts'
import {ActionChat} from './Action/ActionChat.mts'
import {ActionCustom} from './Action/ActionCustom.mts'
import {ActionDiscord} from './Action/ActionDiscord.mts'
import {ActionInput, ActionInputCommand} from './Action/ActionInput.mts'
import {ActionLabel} from './Action/ActionLabel.mts'
import {ActionMoveVRSpace, ActionMoveVRSpaceEntry} from './Action/ActionMoveVRSpace.mts'
import {ActionOBS, ActionOBSFilter, ActionOBSSource} from './Action/ActionOBS.mts'
import {ActionPhilipsHueBulb} from './Action/ActionPhilipsHueBulb.mts'
import {ActionPhilipsHuePlug} from './Action/ActionPhilipsHuePlug.mts'
import {ActionPipe} from './Action/ActionPipe.mts'
import {ActionRemoteCommand} from './Action/ActionRemoteCommand.mts'
import {ActionScreenshot} from './Action/ActionScreenshot.mts'
import {ActionSettingTTS} from './Action/ActionSettingTTS.mts'
import {ActionSettingVR} from './Action/ActionSettingVR.mts'
import {ActionSign} from './Action/ActionSign.mts'
import {ActionSpeech} from './Action/ActionSpeech.mts'
import {ActionSystem, ActionSystemRewardState, ActionSystemRewardStateForEvent, ActionSystemToggle, ActionSystemTrigger, ActionSystemUserEvent} from './Action/ActionSystem.mts'
import {ActionURI} from './Action/ActionURI.mts'
import {ConfigAnnounceCheer, ConfigAnnouncements, ConfigAnnounceRaid, ConfigAnnouncerTriggers, ConfigAnnounceSub} from './Config/ConfigAnnouncements.mts'
import {ConfigChat} from './Config/ConfigChat.mts'
import {ConfigCleanText} from './Config/ConfigCleanText.mts'
import {ConfigCommands} from './Config/ConfigCommands.mts'
import {ConfigController, ConfigControllerChannelTrophyNumber, ConfigControllerChannelTrophySettings, ConfigControllerStateDefaults, ConfigControllerWebsocketsUsed} from './Config/ConfigController.mts'
import {ConfigDiscord} from './Config/ConfigDiscord.mts'
import {ConfigEditor, ConfigEditorFavorite} from './Config/ConfigEditor.mts'
import {ConfigExample, ConfigExampleSub} from './Config/ConfigExample.mts'
import {ConfigImageEditorFontSettings, ConfigImageEditorOutline, ConfigImageEditorRect} from './Config/ConfigImageEditor.mts'
import {ConfigMain, ConfigMainLogo} from './Config/ConfigMain.mts'
import {ConfigOBS} from './Config/ConfigOBS.mts'
import {ConfigOpenVR2WS} from './Config/ConfigOpenVR2WS.mts'
import {ConfigPhilipsHue} from './Config/ConfigPhilipsHue.mts'
import {ConfigPipe, ConfigPipeCustomMessage, ConfigPipeCustomMessageAvatar, ConfigPipeCustomMessageName} from './Config/ConfigPipe.mts'
import {ConfigRelay} from './Config/ConfigRelay.mts'
import {ConfigScreenshots, ConfigScreenshotsCallback} from './Config/ConfigScreenshots.mts'
import {ConfigSign} from './Config/ConfigSign.mts'
import {ConfigSpeech, ConfigSpeechDictionary, ConfigSpeechWordToAudio} from './Config/ConfigSpeech.mts'
import {ConfigSteam} from './Config/ConfigSteam.mts'
import {ConfigTest} from './Config/ConfigTest.mts'
import {ConfigTwitch, ConfigTwitchCategoryOverride} from './Config/ConfigTwitch.mts'
import {EventAccumulatingOptions, EventActionContainer, EventDefault, EventIncrementingOptions, EventMultiTierOptions, EventOptions, EventRewardOptions} from './Event/EventDefault.mts'
import {PresetAudioChannel} from './Preset/PresetAudioChannel.mts'
import {PresetDiscordWebhook} from './Preset/PresetDiscordWebhook.mts'
import {PresetEventCategory} from './Preset/PresetEventCategory.mts'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from './Preset/PresetOBS.mts'
import {PresetPermissions} from './Preset/PresetPermissions.mts'
import {PresetPhilipsHueBulb, PresetPhilipsHueBulbState, PresetPhilipsHuePlug} from './Preset/PresetPhilipsHue.mts'
import {PresetPipeBasic, PresetPipeCustom, PresetPipeCustomAnimation, PresetPipeCustomFollow, PresetPipeCustomTextArea, PresetPipeCustomTransition} from './Preset/PresetPipe.mts'
import {PresetPipeChannel} from './Preset/PresetPipeChannel.mts'
import {PresetReward} from './Preset/PresetReward.mts'
import {PresetSystemActionText} from './Preset/PresetSystemActionText.mts'
import {PresetText} from './Preset/PresetText.mts'
import {SettingChannelTrophyStat} from './Setting/SettingChannel.mts'
import {SettingCounterBase} from './Setting/SettingCounters.mts'
import {SettingDictionaryEntry} from './Setting/SettingDictionary.mts'
import {SettingSteamAchievements, SettingSteamGame} from './Setting/SettingSteam.mts'
import {SettingStreamQuote} from './Setting/SettingStream.mts'
import {SettingTwitchClient, SettingTwitchClip, SettingTwitchRedemption, SettingTwitchReward, SettingTwitchTokens} from './Setting/SettingTwitch.mts'
import {SettingUser, SettingUserCheer, SettingUserMute, SettingUserName, SettingUserRaid, SettingUserSub, SettingUserVoice} from './Setting/SettingUser.mts'
import {TriggerCheer} from './Trigger/TriggerCheer.mts'
import {TriggerCommand} from './Trigger/TriggerCommand.mts'
import {TriggerRelay} from './Trigger/TriggerRelay.mts'
import {TriggerRemoteCommand} from './Trigger/TriggerRemoteCommand.mts'
import {TriggerReward} from './Trigger/TriggerReward.mts'
import {TriggerTimer} from './Trigger/TriggerTimer.mts'

/**
 * TODO: Try to do this dynamically in EJS when we are in Node, scan the Objects source folder and auto-generate this file.
 * This class exists to enlist the things stored in the database in a map.
 * The map is then used to re-instantiate these classes when retrieved from the database.
 * If a class is not enlisted here, it will not be re-instantiated, and thus throw an error.
 */
export class EnlistData {
    static run() {
        // for(const clazz of Object.values(lib)) {
        //     if(clazz instanceof AbstractData) {
        //         new clazz().enlist()
        //     }
        //
        // }
        const objects: AbstractData[] = [
            new ActionAudio(),
            new ActionChat(),
            new ActionCustom(),
            new ActionDiscord(),
            new ActionInput(),
            new ActionInputCommand(),
            new ActionLabel(),
            new ActionURI(),
            new ActionMoveVRSpace(),
            new ActionMoveVRSpaceEntry(),
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
            new ActionSystemUserEvent(),

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
            new ConfigMain(),
            new ConfigMainLogo(),
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
            new EventRewardOptions(),
            new EventIncrementingOptions(),
            new EventAccumulatingOptions(),
            new EventMultiTierOptions(),
            new EventActionContainer(),

            new PresetAudioChannel(),
            new PresetDiscordWebhook(),
            new PresetOBSScene(),
            new PresetOBSSource(),
            new PresetOBSFilter(),
            new PresetPermissions(),
            new PresetPhilipsHueBulbState(),
            new PresetPhilipsHueBulb(),
            new PresetPhilipsHuePlug(),
            new PresetPipeBasic(),
            new PresetPipeChannel(),
            new PresetPipeCustom(),
            new PresetPipeCustomFollow(),
            new PresetPipeCustomAnimation(),
            new PresetPipeCustomTransition(),
            new PresetPipeCustomTextArea(),
            new PresetReward(),
            new PresetSystemActionText(),
            new PresetText(),
            new PresetEventCategory(),

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