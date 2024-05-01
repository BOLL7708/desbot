import {OptionEntryUsage} from '../Objects/Options/OptionEntryType.js'

export default class ArrayUtils {
    /**
     *
     * @param array
     * @param type Values from OptionEntryUsage
     * @param index
     */
    static getAsType<T>(array: T[], type: number, index?: number): T[] {
        if(array.length <= 1) return array
        switch(type) {
            case OptionEntryUsage.First: return [array[0]]
            case OptionEntryUsage.Last: return [array[array.length - 1]]
            case OptionEntryUsage.All: return array
            case OptionEntryUsage.OneRandom: {
                const random = ArrayUtils.getRandom(array)
                return random !== undefined ? [random] : []
            }
            case OptionEntryUsage.AllRandom: {
                return ArrayUtils.shuffle(array)
            }
            case OptionEntryUsage.OneByIndex: {
                const specific = ArrayUtils.getSpecific(array, index)
                return specific !== undefined ? [specific] : []
            }
            case OptionEntryUsage.OneByIndexOnLoop: {
                index = (index ?? 0) % array.length
                const specific = ArrayUtils.getSpecific(array, index)
                return specific !== undefined ? [specific] : []
            }
            default: return array
        }
    }

    /**
     * Shuffles the array in place.
     * @link https://bost.ocks.org/mike/shuffle/
     * @returns Shuffled array
     */
    static shuffle<T>(array: T[]): T[] {
        let max = array.length, transfer, index;
        while (max) { // Loop over the whole array
            index = Math.floor(Math.random() * max--); // Randomize index from front of array, max reduces by 1 each time
            transfer = array[max]; // Cache current value
            array[max] = array[index]; // Copy random value over current value
            array[index] = transfer; // Replace old random value with cache of current value
        }
        return array
    }

    /**
     * Will return a random value from the array
     * @returns Value or undefined if none could be retrieved.
     */
    static getRandom<T>(array: T[]): T|undefined {
        if(array.length == 0) return undefined
        if(array.length == 1) return array[0]
        return array[Math.floor(Math.random()*array.length)]
    }

    /**
     * Will return the value for a specific index in an array
     * @param array Array to get values from
     * @param index Will use 0 if not supplied, will max out at array length if too high
     * @returns Value or undefined if none could be retrieved.
     */
    static getSpecific<T>(array: T[], index: number = 0): T|undefined {
        if(array.length == 0) return undefined
        if(index >= array.length) return array[array.length - 1]
        if(index < 0) return array[0]
        else return array[index]
    }

    /**
     * Will push an item to the array if is not undefined.
     * @param array
     * @param item Item to push to the array.
     * @returns The new length of the array or -1 if unable to push.
     */
    static pushIfExists<T>(array: T[], item: T|undefined): number {
        if(item !== undefined) {
            array.push(item)
            return array.length
        }
        return -1
    }

    static removeUndefined<T>(array: (T|undefined)[]): T[] {
        return array.filter((item) => item !== undefined) as T[]
    }
// endregion
}