import {TKeys} from '../_data/!keys.js'
import {TTwitchRedemptionStatus} from './itwitch_pubsub.js'

// Settings
export interface IUserVoice {
    userName: string
    languageCode: string
    voiceName: string
    gender: string
}
export interface IUserName {
    userName: string
    shortName: string
    editor: string
    datetime: string
}
export interface IDictionaryEntry {
    original: string
    substitute: string
    editor: string
    datetime: string
}
export interface ITwitchRewardPair {
    key: TKeys
    id: string
}
export interface IChannelTrophyStat {
    userId: string
    index: string
    cost: string
}
export interface ITwitchClip {
    id: string
}
export interface IStreamQuote {
    submitter: string
    author: string
    quote: string
    datetime: string
    game: string
}
export interface ITwitchRedemption {
    userId: string,
    rewardId: string,
    redemptionId: string,
    time: string,
    status: TTwitchRedemptionStatus,
    cost: string
}
export interface IEventCounter {
    key: string
    count: number
}