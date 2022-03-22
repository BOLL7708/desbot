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
}
interface IDictionaryEntry {
    original: string
    substitute: string
    user: string
    date: string
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