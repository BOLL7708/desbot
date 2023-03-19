import {ConfigCleanText} from './Config/CleanText.js'
import {ConfigDiscord} from './Config/Discord.js'
import {ConfigExample} from './Config/Example.js'
import {ConfigImageEditorOutline} from './Config/ImageEditor.js'
import {ConfigOpenVR2WS} from './Config/OpenVR2WS.js'
import {ConfigPhilipsHue} from './Config/PhilipsHue.js'
import {ConfigPipe} from './Config/Pipe.js'
import {ConfigRelay} from './Config/Relay.js'
import {ConfigSign} from './Config/Sign.js'
import {ConfigSpeech} from './Config/Speech.js'
import {PresetPipeBasic, PresetPipeCustom} from './Preset/Pipe.js'
import {SettingChannelTrophyStat} from './Setting/Channel.js'
import {SettingIncrementingCounter} from './Setting/Counters.js'
import {SettingDictionaryEntry} from './Setting/Dictionary.js'
import {SettingImportStatus} from './Setting/Import.js'
import {SettingSteamAchievements} from './Setting/Steam.js'
import {SettingStreamQuote} from './Setting/Stream.js'
import {SettingTwitchCheer} from './Setting/Twitch.js'
import {SettingUserMute} from './Setting/User.js'
import {EventDefault} from './Event/EventDefault.js'
import {ActionAudio} from './Action/ActionAudio.js'
import {ActionChat} from './Action/ActionChat.js'
import {ActionCustom} from './Action/ActionCustom.js'
import {ActionDiscord} from './Action/ActionDiscord.js'
import {ActionInput} from './Action/ActionInput.js'
import {ActionMoveVRSpace} from './Action/ActionMoveVRSpace.js'
import {ActionLabel} from './Action/ActionLabel.js'
import {ActionPhilipsHueBulb} from './Action/ActionPhilipsHueBulb.js'
import {ActionOBS} from './Action/ActionOBS.js'
import {ActionPipe} from './Action/ActionPipe.js'
import {ActionRemoteCommand} from './Action/ActionRemoteCommand.js'
import {ActionScreenshot} from './Action/ActionScreenshot.js'
import {ActionSettingTTS} from './Action/ActionSettingTTS.js'
import {ActionSettingVR} from './Action/ActionSettingVR.js'
import {ActionSign} from './Action/ActionSign.js'
import {ActionSpeech} from './Action/ActionSpeech.js'
import {ActionSystem} from './Action/ActionSystem.js'
import {ActionLink} from './Action/ActionLink.js'
import {ActionWeb} from './Action/ActionWeb.js'
import {ActionWhisper} from './Action/ActionWhisper.js'
import {TriggerCheer} from './Trigger/TriggerCheer.js'
import {TriggerCommand} from './Trigger/TriggerCommand.js'
import {TriggerRemoteCommand} from './Trigger/TriggerRemoteCommand.js'
import {TriggerTimer} from './Trigger/TriggerTimer.js'
import {ConfigSteam} from './Config/Steam.js'
import {PresetReward} from './Preset/Reward.js'
import {PresetPermissions} from './Preset/Permissions.js'
import {PresetText} from './Preset/Text.js'
import {ActionPhilipsHuePlug} from './Action/ActionPhilipsHuePlug.js'
import {EnumEntryType} from '../Enums/EntryType.js'
import {EnumTwitchRewardUsable, EnumTwitchRewardVisible} from '../Enums/Twitch.js'
import {EnumCommandType} from '../Enums/CommandType.js'
import {EnumScreenshotType} from '../Enums/ScreenshotType.js'
import {EnumSteamVRSettingType} from '../Enums/SteamVRSetting.js'
import {EnumTTSType} from '../Enums/TTS.js'

/**
 * This was added as a way to get all modules to load if this class is requested, because the classes are
 * referenced by strings, it would not automatically happen otherwise. It's an ugly but working solution.
 * It was extracted into a separate class as putting it in the mapping class caused circular dependencies.
 * @private
 */
export default class ImportDataObjectClasses {
    public static init() {
        this.putClassInHereToMakeSureItLoads()
    }

    private static putClassInHereToMakeSureItLoads() {
        const arr1 = [
            // Configs
            new ConfigCleanText(),
            new ConfigDiscord(),
            new ConfigExample(),
            new ConfigImageEditorOutline(),
            new ConfigOpenVR2WS(),
            new ConfigPhilipsHue(),
            new ConfigPipe(),
            new ConfigRelay(),
            new ConfigSign(),
            new ConfigSpeech(),
            new ConfigSteam(),

            // Presets
            new PresetPipeBasic(),
            new PresetPipeCustom(),
            new PresetPermissions(),
            new PresetReward(),
            new PresetText(),

            // Settings
            new SettingChannelTrophyStat(),
            new SettingIncrementingCounter(),
            new SettingDictionaryEntry(),
            new SettingImportStatus(),
            new SettingSteamAchievements(),
            new SettingStreamQuote(),
            new SettingTwitchCheer(),
            new SettingUserMute(),

            // Event
            new EventDefault(),

            // Triggers
            new TriggerCheer(),
            new TriggerCommand(),
            new TriggerRemoteCommand(),
            new TriggerTimer(),

            // Actions
            new ActionAudio(),
            new ActionChat(),
            new ActionCustom(),
            new ActionDiscord(),
            new ActionInput(),
            new ActionLabel(),
            new ActionPhilipsHueBulb(),
            new ActionPhilipsHuePlug(),
            new ActionMoveVRSpace(),
            new ActionOBS(),
            new ActionPipe(),
            new ActionRemoteCommand(),
            new ActionScreenshot(),
            new ActionSettingTTS(),
            new ActionSettingVR(),
            new ActionSign(),
            new ActionSpeech(),
            new ActionSystem(),
            new ActionLink(),
            new ActionWhisper()
        ]
        // Enums
        const arr2 = [
            EnumCommandType,
            EnumEntryType,
            EnumScreenshotType,
            EnumSteamVRSettingType,
            EnumTTSType,
            EnumTwitchRewardVisible
        ]
    }
}