export interface IStringDictionary {
    [key: string]: string
}
export interface INumberDictionary {
    [key: string]: number
}
export interface IBooleanDictionary {
    [key: string]: boolean
}
export interface IDictionary<T> {
    [key: string]: T
}