import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingCounterBase extends Data {
    count: number = 0
    enlist() {
        // This is weird, does it work doing it like this?
        DataMap.addRootInstance({
            instance: new SettingAccumulatingCounter(),
            documentation: {
                reachedGoal: 'If the goal has been reached.'
            }
        })
        DataMap.addRootInstance({
            instance: new SettingIncrementingCounter(),
            documentation: {
                reachedMax: 'If the counter has reached the optional maximum value.'
            }
        })
    }
}
export class SettingAccumulatingCounter extends SettingCounterBase {
    reachedGoal: boolean = false
}
export class SettingIncrementingCounter extends SettingCounterBase {
    reachedMax = false
}