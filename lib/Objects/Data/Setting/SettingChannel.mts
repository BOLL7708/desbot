import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class SettingChannelTrophyStat extends AbstractData {
    userId: number = 0
    index: number = 0

    enlist() {
        DataMap.addRootInstance({ instance: new SettingChannelTrophyStat() })
    }
}