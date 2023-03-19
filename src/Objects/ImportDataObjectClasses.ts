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
import {PresetPipeBasic} from './Preset/Pipe.js'
import {SettingChannelTrophyStat} from './Setting/Channel.js'
import {SettingIncrementingCounter} from './Setting/Counters.js'
import {SettingDictionaryEntry} from './Setting/Dictionary.js'
import {SettingImportStatus} from './Setting/Import.js'
import {SettingSteamAchievements} from './Setting/Steam.js'
import {SettingStreamQuote} from './Setting/Stream.js'
import {SettingTwitchCheer} from './Setting/Twitch.js'
import {SettingUserMute} from './Setting/User.js'
import {TriggerCheer} from './Trigger/TriggerCheer.js'
import {TriggerCommand} from './Trigger/TriggerCommand.js'
import {TriggerRemoteCommand} from './Trigger/TriggerRemoteCommand.js'
import {TriggerTimer} from './Trigger/TriggerTimer.js'
import {ConfigSteam} from './Config/Steam.js'
import {PresetReward} from './Preset/Reward.js'
import {PresetPermissions} from './Preset/Permissions.js'
import {PresetText} from './Preset/Text.js'

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
        let arr = [
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
            // Triggers
            new TriggerCheer(),
            new TriggerCommand(),
            new TriggerRemoteCommand(),
            new TriggerTimer(),
        ]
    }
}