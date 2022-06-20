// Settings
interface IUserVoice {
    userName: string
    languageCode: string
    voiceName: string
    gender: string
}
interface IUserName {
    userName: string
    shortName: string
    editor: string
    datetime: string
}
interface IDictionaryEntry {
    original: string
    substitute: string
    editor: string
    datetime: string
}
interface ITwitchRewardPair {
    key: string
    id: string
}
interface IChannelTrophyStat {
    userId: string
    index: string
    cost: string
}
interface ITwitchClip {
    id: string
}
interface IStreamQuote {
    submitter: string
    author: string
    quote: string
    datetime: string
    game: string
}
interface ITwitchRedemption {
    userId: string,
    rewardId: string,
    redemptionId: string,
    time: string,
    status: TTwitchRedemptionStatus,
    cost: string
}