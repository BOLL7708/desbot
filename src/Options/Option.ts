import {IStringDictionary} from '../Interfaces/igeneral.js'

export class Option {
    /**
     * Get the name of the class appended with the Enum flag.
     * If this ID is referenced when instancing a class, it will be a dropdown listing the properties as alternatives.
     */
    static ref() {
        return this.name+'|enum'
    }
    static keyMap(): IStringDictionary {
        const entries = Object.entries(this)
        return Object.fromEntries(
            entries.map(([key, value]) => [value.toString(), key.toString()])
        ) as IStringDictionary
    }
}