import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingImportStatus extends BaseDataObject {
    done: boolean = false
}

DataObjectMap.addMainInstance(new SettingImportStatus())