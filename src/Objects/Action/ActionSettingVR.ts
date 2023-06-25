import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionSteamVRSettingCategory, OptionSteamVRSettingType} from '../../Options/OptionSteamVRSetting.js'

export class ActionSettingVR extends Data {
    category = OptionSteamVRSettingCategory.CurrentAppID
    setting = OptionSteamVRSettingType.WorldScale
    setToValue: string = ''
    resetToValue: string = ''
    duration: number = 0

    enlist() {
        DataMap.addRootInstance(
            new ActionSettingVR(),
            'Used to change SteamVR settings.',
            {
                setting: 'The format is [category]|[setting]|[default], where an empty category will use the app ID for game specific settings.',
                setToValue: 'The value to set the setting to, takes various formats, will use possible default if missing.',
                resetToValue: 'The value to reset to after the duration has expired, will fall back on hard coded value if missing.',
                duration: 'The amount of time in seconds to wait before resetting the setting to default, skipped if set to 0.'
            },
            {
                category: OptionSteamVRSettingCategory.ref(),
                setting: OptionSteamVRSettingType.ref()
            }
        )
    }
}