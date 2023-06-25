import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingChannelTrophyStat extends Data {
    userId: number = 0
    index: number = 0

    register() {
        DataMap.addRootInstance(new SettingChannelTrophyStat())
    }
}