// Data
export interface ISentence {
    text: string
    userName: string
    type: number
    meta: any
}

export interface IBlacklistEntry {
    userName: string
    active: boolean
    reason: string
}