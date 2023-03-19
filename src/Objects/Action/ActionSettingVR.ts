import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumSteamVRSettingCategory, EnumSteamVRSettingType} from '../../Enums/SteamVRSetting.js'

export class ActionSettingVR extends BaseDataObject {
    category = EnumSteamVRSettingCategory.CurrentAppID
    setting = EnumSteamVRSettingType.WorldScale
    setToValue: string = ''
    resetToValue: string = ''
    duration: number = 0
}

DataObjectMap.addRootInstance(
    new ActionSettingVR(),
    'Used to change SteamVR settings.',
    {
        setting: 'The format is [category]|[setting]|[default], where an empty category will use the app ID for game specific settings.',
        setToValue: 'The value to set the setting to, takes various formats, will use possible default if missing.',
        resetToValue: 'The value to reset to after the duration has expired, will fall back on hard coded value if missing.',
        duration: 'The amount of time in seconds to wait before resetting the setting to default, skipped if set to 0.'
    },
    {
        category: EnumSteamVRSettingCategory.ref(),
        setting: EnumSteamVRSettingType.ref()
    }
)