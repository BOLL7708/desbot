import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingCounterBase extends BaseDataObject {
    count: number = 0

    register() {
        // This is weird, does it work doing it like this?
        DataObjectMap.addRootInstance(new SettingAccumulatingCounter())
        DataObjectMap.addRootInstance(new SettingIncrementingCounter())
    }
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}