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