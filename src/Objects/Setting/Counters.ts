import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingCounterBase extends BaseDataObject {
    count: number = 0
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}

DataObjectMap.addRootInstance(new SettingAccumulatingCounter())
DataObjectMap.addRootInstance(new SettingIncrementingCounter())