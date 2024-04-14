import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export class SettingChannelTrophyStat extends AbstractData {
    userId: number = 0
    index: number = 0

    enlist() {
        DataMap.addRootInstance({ instance: new SettingChannelTrophyStat() })
    }
}