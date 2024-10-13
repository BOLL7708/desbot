import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class SettingStreamQuote extends AbstractData {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''

    enlist() {
        DataMap.addRootInstance({ instance: new SettingStreamQuote() })
    }
}