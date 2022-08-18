/**
 * Array extensions, we add a type and various accessors for various output.
 */
enum EArrayType {
    All,
    Random,
    AllRandom,
    Specific
}
interface Array<T> {
    __type: EArrayType
    useSpecific(): Array<T>
    useRandom(): Array<T>
    useAllRandom(): Array<T>
    useAll(): Array<T>

    shuffle(): Array<T>
    getRandom(): T|undefined
    getSpecific(index?: number): T|undefined
    getAsType(index?: number): Array<T>

    pushIfExists<T>(item: T): number
}

Array.prototype.useAll = function(): Array<any> {
    this.__type = EArrayType.All
    return this
}
Array.prototype.useRandom = function(): Array<any> {
    this.__type = EArrayType.Random
    return this
}
Array.prototype.useAllRandom = function(): Array<any> {
    this.__type = EArrayType.AllRandom
    return this
}
Array.prototype.useSpecific = function(): Array<any> {
    this.__type = EArrayType.Specific
    return this
}

/**
 * Will use the `__type` property to determine how to return the array.
 * Returns an array with the values to act upon, modified by the `__type` extension property of the array.
 * @param index Use to retrieve a specific value, will use 0 if missing, uses last value if too large.
 * @returns A resulting array with one or more items depending on the set type.
 */
Array.prototype.getAsType = function<T>(index?: number): T[] {
    if(this.length <= 1) return this
    switch(this.__type) {
        case EArrayType.All: return this
        case EArrayType.Random: {
            const random = this.getRandom()
            return random !== undefined ? [random] : []
        }
        case EArrayType.AllRandom: {
            return this.shuffle()
        }
        case EArrayType.Specific: {
            const specific = this.getSpecific(index)
            return specific !== undefined ? [specific] : []
        }
        default: return this
    }
}

/**
 * Shuffles the array in place.
 * @link https://bost.ocks.org/mike/shuffle/
 * @returns Shuffled array
 */
Array.prototype.shuffle = function(): Array<any> {
    let max = this.length, transfer, index;
    while (max) { // Loop over the whole array
      index = Math.floor(Math.random() * max--); // Randomize index from front of array, max reduces by 1 each time
      transfer = this[max]; // Cache current value
      this[max] = this[index]; // Copy random value over current value
      this[index] = transfer; // Replace old random value with cache of current value
    }
    return this
}

/**
 * Will return a random value from the array
 * @returns Value or undefined if none could be retrieved.
 */
Array.prototype.getRandom = function<T>(): T|undefined {
    if(this.length == 0) return undefined
    if(this.length == 1) return this[0]
    return this[Math.floor(Math.random()*this.length)]
}

/**
 * Will return the value for a specific index in an array
 * @param arr Array to get values from
 * @param index Will use 0 if not supplied, will max out at array length if too high 
 * @returns Value or undefined if none could be retrieved.
 */
Array.prototype.getSpecific = function<T>(index: number = 0): T|undefined {
    if(this.length == 0) return undefined
    if(index >= this.length) return this[this.length - 1]
    if(index < 0) return this[0]
    else return this[index]
}

/**
 * Will push an item to the array if is not undefined.
 * @param item Item to push to the array.
 * @returns The new length of the array or -1 if unable to push.
 */
Array.prototype.pushIfExists = function<T>(item: T|undefined): number {
    if(item !== undefined) {
        this.push(item)
        return this.length
    }
    return -1
}

/**
 * String extensions
 */
interface String {
    toBoolean(def: boolean): boolean
    toBooleanOrUndefined(): boolean|undefined
}
String.prototype.toBoolean = function(def: boolean): boolean {
    return this.toBooleanOrUndefined() ?? def
}
String.prototype.toBooleanOrUndefined = function(): boolean|undefined {
    const trueStrings = ['true', 't', '1', 'on', 'yes', 'y', '+']
    const falseStrings = ['false', 'f', '0', 'off', 'no', 'n', '-']
    const strCopy = this.toLowerCase()
    if(trueStrings.includes(strCopy)) return true
    if(falseStrings.includes(strCopy)) return false
    return undefined
}