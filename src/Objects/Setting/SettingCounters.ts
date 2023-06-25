import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingCounterBase extends Data {
    count: number = 0

    register() {
        // This is weird, does it work doing it like this?
        DataMap.addRootInstance(new SettingAccumulatingCounter())
        DataMap.addRootInstance(new SettingIncrementingCounter())
    }
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}