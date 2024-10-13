import {IStringDictionary} from '../../../bot/Interfaces/igeneral.mts'

export abstract class AbstractOption {
    /**
     * Get the name of the class appended with the Enum flag.
     * If this ID is referenced when instancing a class, it will be a dropdown listing the properties as alternatives.
     */
    static get ref() {
        return this.name+'|option|type='+this.getType()
    }
    static keyMap(): IStringDictionary {
        const entries = Object.entries(this)
        return Object.fromEntries(
            entries.map(([key, value]) => [value.toString(), key.toString()])
        ) as IStringDictionary
    }
    static nameFromKey(key: string|number): string {
        return this.keyMap()[key.toString()] ?? key.toString()
    }
    static getType(): string {
        return typeof Object.values(this).pop()
    }
}