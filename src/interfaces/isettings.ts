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
interface IDictionaryPair {
    original: string
    substitute: string
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