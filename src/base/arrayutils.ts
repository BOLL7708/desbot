class ArrayUtils {
    /**
     * Shuffles the array in place.
     * @link https://bost.ocks.org/mike/shuffle/
     * @returns Shuffled array
     */
    static shuffle = function<T>(array: T[]): T[] {
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
    static random = function<T>(array: T[]): T|undefined {
        if(array.length == 0) return undefined
        if(array.length == 1) return array[0]
        return array[Math.floor(Math.random()*array.length)]
    }

    /**
     * Will return the value for a specific index in an array
     * @param arr Array to get values from
     * @param index Will use 0 if not supplied, will max out at array length if too high 
     * @returns Value or undefined if none could be retrieved.
     */
    static specific = function<T>(array: T[], index: number = 0): T|undefined {
        if(array.length == 0) return undefined
        if(index >= array.length) return array[array.length - 1]
        if(index < 0) return array[0]
        else return array[index]
    }

    /**
     * Will push an item to the array if is not undefined.
     * @param item Item to push to the array.
     * @returns The new length of the array or -1 if unable to push.
     */
    static pushIfExists = function<T>(array: T[], item: T|undefined): number {
        if(item !== undefined) {
            array.push(item)
            return array.length
        }
        return -1
    }
}