import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingChannelTrophyStat extends BaseDataObject {
    userId: number = 0
    index: number = 0
}

DataObjectMap.addRootInstance(new SettingChannelTrophyStat())