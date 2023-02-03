import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingStreamQuote extends BaseDataObject {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''
}

DataObjectMap.addMainInstance(new SettingStreamQuote())