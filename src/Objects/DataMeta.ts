import {IStringDictionary} from '../Interfaces/igeneral.js'

export class DataMeta {
    constructor(
        public description?: string,
        public documentation?: IStringDictionary,
        public instructions?: IStringDictionary,
        public types?: IStringDictionary,
        public isRoot: boolean = false
    ) {}
}