import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class SettingStreamQuote extends AbstractData {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''

    enlist() {
        DataMap.addRootInstance({ instance: new SettingStreamQuote() })
    }
}