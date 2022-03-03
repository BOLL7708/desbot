// Data
interface ISentence {
    text: string
    userName: string
    type: number
    meta: any
}

interface IBlacklistEntry {
    userName: string
    active: boolean
    reason: string
}