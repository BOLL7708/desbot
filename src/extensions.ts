/**
 * Array Type, an extension done to know if an array of configs/values is supposed to be used in a specific way.
 */
enum EArrayType {
    Specific,
    Random,
    All
}
interface Array<T> {
    __type: EArrayType
    useSpecific(): Array<T>
    useRandom(): Array<T>
    useAll(): Array<T>
    isSpecific(): boolean
    isRandom(): boolean
    isAll(): boolean
}

Array.prototype.useSpecific = function(): Array<any> {
    this.__type = EArrayType.Specific
    return this
}
Array.prototype.useRandom = function(): Array<any> {
    this.__type = EArrayType.Random
    return this
}
Array.prototype.useAll = function(): Array<any> {
    this.__type = EArrayType.All
    return this
}

Array.prototype.isSpecific = function(): boolean {
    return this.__type == EArrayType.Random
}
Array.prototype.isSpecific = function(): boolean {
    return this.__type == EArrayType.Random
}
Array.prototype.isSpecific = function(): boolean {
    return this.__type == EArrayType.Random
}