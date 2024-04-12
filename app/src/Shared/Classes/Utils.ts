import Constants from './Constants.js'
import Color from './ColorConstants.js'

export default class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        const [first, ...rest] = str.split(needle)
        return rest ? [first, rest.join(needle)] : [first]
    }

    static async sha256(message: string) {
        const textBuffer = new TextEncoder().encode(message); // encode as UTF-8
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer); // hash the message
        const byteArray = Array.from(new Uint8Array(hashBuffer)); // convert ArrayBuffer to Array
        return btoa(String.fromCharCode(...byteArray));
    }

    static b64toBlob = (b64Data: string, contentType='image/png', sliceSize=512) => {
        if(b64Data.includes(',')) b64Data = b64Data.split(',').pop() ?? b64Data
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
    
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, {type: contentType});
    }

    static b64ToDataUrl(b64data: string, contentType='image/png'):string {
        return `data:${contentType};base64,${b64data}`
    }

    static unescapeQuotes(str: string): string {
        return str.replace(/\\"/g, '"')
    }

    static hexToDecColor(hex: string): number {
        if(hex.indexOf('#') == 0) hex = hex.substr(1)
        if(hex.length == 3) hex = hex.split('').map(ch => ch+ch).join('')
        return parseInt(hex, 16)
    }

    static matchFirstChar(text:string, chars:string[]):Boolean {
        let trimmed = text.trim()
        for(let i=0; i<chars.length; i++) {
            if(trimmed.indexOf(chars[i]) == 0) return true
        }
        return false
    }

    static escapeForDiscord(text:string):string {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/_/g, '\\_')
            .replace(/\*/g, '\\*')
            .replace(/~/g, '\\~')
            .replace(/`/g, '\\`')
            .replace(/@/g, '**(at)**')
    }

    /**
     * Fixes links that lack protocol, adds https://
     * @param text Text to fix links in
     * @returns resulting text with fixed links
     */
    static fixLinks(text:string):string {
        // Matching start/space + NOT http(s):// and then word.word(/|?)word
        // The first space is group 1, the link without HTTPS is group 2
        const pattern = /(\s|^)(?:(?!https?:\/\/))(\S+\.\S+(?:\/|\?)+\S+)/g
        
        // We add the space back in to retain link integrity
        return text.replace(pattern, "$1https://$2") 
    }

    static isUrl(text:string): boolean {
        return text.match(/^https?:\/\//) != null
    }

    static isDataUrl(imageData: string): boolean {
        return imageData.match(/^data:.*,/) != null
    }

    static removeImageHeader(imageData:string) {
        if(this.isDataUrl(imageData)) {
            return imageData.replace(/^data:.*,/, '')
        } else {
            return imageData
        }
    }

    static getNonce(tag:string) {
        return `${tag}-${Date.now()}-${Math.round(Math.random()*1000)}`
    }

    static logWithBold(message:string, color:string) {
        const formatNormal = `color: ${color}; font-weight: normal;`
        const formatBold = `color: ${color}; font-weight: bold;`
        let formats = [formatNormal];
        for(let i=0; i<message.length;i++) {
            if (message[i] === "<") formats.push(formatBold);
            else if (message[i] === ">") formats.push(formatNormal);
        }
        console.log(`%c${message}`.replace(/</g, '%c').replace(/>/g, '%c'), ...formats)
    }

    static log(message: string, color:string, bold:boolean=false, big:boolean=false) {
        let format = `color: ${color};`
        if(bold) format += 'font-weight: bold;'
        if(big) format += 'font-size: 150%;'
        console.log(`%c${message}`, format)
    }

    /**
     * Will return a random string from an array of strings
     * @param value Array of strings, if not an array, will just return the string
     * @returns The random string
     */
    static randomFromArray<Type>(value: Type[]|Type): Type {
        if(Array.isArray(value)) {
            if(value.length == 1) return value[0]
            else return value[Math.floor(Math.random()*value.length)]
        }
        else return value
    }

    /**
     * Will return a random value or a specific value if index is supplied.
     * @param value 
     * @param index 
     * @returns 
     */
    static randomOrSpecificFromArray<Type>(value: Type[]|Type, index: number|undefined): Type {    
        let result: Type
        if(Array.isArray(value)) {
            // Limit index to size of array
            if(Number.isInteger(index) && (index ?? 0) >= value.length) index = value.length - 1
            
            // Pick out the index if supplied, else randomize
            result = index != undefined && Array.isArray(value) && value.length > index
                ? value[index]
                : Utils.randomFromArray(value)
        } else {
            // Return value directly if not an array
            result = value
        }
        return result
    }

    static ensureArray<Type>(value: Type[]|Type|undefined): Type[] {
        if(value === undefined) return []
        return Array.isArray(value) ? value : [value]
    }

    static ensureValue<Type>(value: Type|Type[]): Type|undefined {
        return (Array.isArray(value) && value.length > 0) ? value.shift() : <Type> value
    }

    static ensureNumber(value: any, fallback: number = 0): number {
        switch(typeof value) {
            case 'number': return isNaN(value) ? fallback : value
            case 'string':
                const num = parseFloat(value)
                return isNaN(num) ? fallback : num
            case 'boolean': return value ? 1 : 0
            default: return fallback
        }
    }

    static encode(str: string): string {
        let base64 = btoa(str)
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        return base64
    }
    static decode(base64: string): string {
        let str = base64.replace(/-/g, '+').replace(/_/g, '/')
        while (str.length % 4) {
            str += '='
        }
        return atob(str)
    }

    static numberToDiscordEmote(value: number, addHash: boolean = false): string {
        let numbers: { [x: string]: string } = {
            '0': ':zero:',
            '1': ':one:',
            '2': ':two:',
            '3': ':three:',
            '4': ':four:',
            '5': ':five:',
            '6': ':six:',
            '7': ':seven:',
            '8': ':eight:',
            '9': ':nine:'
        }
        const hash: string = addHash ? ':hash:' : ''
        return hash+value.toString().split('').map(n => numbers[n]).join('')
    }

    /**
     * Mostly used for Discord embeds
     * @returns string representation of current ISO timestamp
     */
    static getISOTimestamp(input?: string): string {
        const date = (input != undefined) ? new Date(Date.parse(input)) : new Date()
        return date.toISOString()
    }

    static getDiscordTimetag(input: string|null, format: string='F'): string {
        const date = (input != null) ? new Date(Date.parse(input)) : new Date()
        return `<t:${Math.round(date.getTime()/1000)}:${format}>`
    }

    /**
     * Await this function to have a delay in an async function.
     * @param time 
     * @returns 
     */
    static delay(time: number) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    /**
     * Load image into element with promise
     */
    static makeImage(urlOrData: string): Promise<HTMLImageElement|null> {
        return new Promise((resolve, reject) => {
            if(this.isDataUrl(urlOrData) || this.isUrl(urlOrData)) {
                const img = new Image()
                img.onload = ()=>{ resolve(img) }
                img.src = urlOrData
            } else {
                resolve(null)
            }
        })
    }

    /**
     * Clone anything data structure by JSON stringify and parse
     * @param data Data to clone
     * @returns The cloned data
     */
    static clone<Type>(data: Type): Type {
        return JSON.parse(JSON.stringify(data)) as Type
    }

    /**
     * Splits a Steam app key into parts and returns the parsed number
     * @param appId 
     * @returns application ID number or NaN if not a valid app key
     */
    static numberFromAppId(appId: string|undefined): number {
        return Utils.toInt(appId?.split('.').pop())
    }

    /**
     * Basically a parseInt that also takes undefined
     * @param intStr
     * @param defaultValue
     */
    static toInt(intStr: string|undefined, defaultValue: number = NaN): number {
        return parseInt(intStr ?? '') || defaultValue
    }

    /**
     * Returns the deduced boolean value for a string, provided default or false if no match.
     * @param boolStr
     * @param defaultValue
     */
    static toBool(boolStr: string|undefined|null|unknown, defaultValue: boolean = false): boolean {
        if(boolStr === undefined || boolStr === null || typeof boolStr !== 'string' || boolStr.length == 0) return defaultValue
        const firstChar: string = boolStr.toLowerCase()[0]
        const trueIsh: string[] = ['t', 'y', '1']
        const falseIsh: string[] = ['f', 'n', '0']
        if(trueIsh.includes(firstChar)) return true
        if(falseIsh.includes(firstChar)) return false
        return defaultValue
    }

    static removeLastPart(splitOn: string, text: string|undefined): string {
        if(text) {
            const arr = text.split(splitOn)
            arr.pop()
            return arr.join(splitOn)
        }
        return ''
    }
    
    static countBoolProps(obj: { [key: string]: boolean }): number {
        return Object.keys(obj).filter(key => obj[key]).length
    }

    static splitOnAny(text: string|undefined, needles: string): string[] {
        if(!text) return []
        for(const needle of needles) {
            if(text.includes(needle)) {
                return text.split(needle)
            }
        }
        return [text]
    }

    static formatShortNumber(nr: number, withDecimals: boolean = true): string {
        const m = 1000000, k = 1000, useDec = withDecimals ? 1 : 0
             if (nr >= 100000000) return (nr/m).toFixed()+'m' // 100m
        else if (nr >= 10000000) return (nr/m).toFixed(1*useDec)+'m' // 10.0m
        else if (nr >= 1000000) return (nr/m).toFixed(2*useDec)+'m' // 1.00m
        else if (nr >= 100000) return (nr/k).toFixed()+'k' // 100k
        else if (nr >= 10000) return (nr/k).toFixed(1*useDec)+'k' // 10.0k
        else if (nr >= 1000) return (nr/k).toFixed(2*useDec)+'k' // 1.00k
        else if (nr >= 100) return nr.toFixed() // 100
        else if (nr >= 10) return nr.toFixed(1*useDec) // 10.0
        else return nr.toFixed(2*useDec) // 1.00
    }

    /**
     * Convert the hex value of an emoji to string
     * @param emojiHex
     */
    static emojiHexToString(emojiHex: string): string {
        emojiHex = emojiHex.toLowerCase()
        if(emojiHex[0] == '\\') emojiHex = emojiHex.substring(1)
        if(emojiHex[0] == 'u') emojiHex = emojiHex.substring(1)
        return String.fromCodePoint(parseInt(emojiHex, 16)).trim()
    }

    /**
     * Split a filename on underscore and extract emoji hex values from it.
     * This is kind of specialized to work with images from Google's Emoji Kitchen,
     * @param fileName
     */
    static getEmojisFromFileName(fileName: string): string[] {
        return fileName.split('.')
            .shift()
            ?.split('_')
            .map((code)=>this.emojiHexToString(code)) ?? []
    }

    static getElement<T>(id: string): T|undefined {
        return (document.querySelector(id) as T|null) ?? undefined
    }

    static getAuth(): string {
        return localStorage.getItem(Constants.LOCAL_STORAGE_KEY_AUTH+Utils.getCurrentPath()) ?? ''
    }
    static getAuthInit(additionalHeaders: HeadersInit = {}): RequestInit {
        return {
            headers: {Authorization: Utils.getAuth(), ...additionalHeaders}
        }
    }
    static clearAuth(): void {
        localStorage.removeItem(Constants.LOCAL_STORAGE_KEY_AUTH+Utils.getCurrentPath())
    }

    static getCurrentPath(): string {
        let path = window.location.pathname
        const pathArray = path.split('/');
        while(pathArray.length && (path.includes('.') || path.length == 0)) {
            pathArray.pop()
            path = pathArray.join('/')
        }
        return path
    }

    /**
     * @link https://stackoverflow.com/a/32108184
     * @param object
     */
    static isEmptyObject(object: any) {
        return object
            && Object.keys(object).length === 0
            && Object.getPrototypeOf(object) === Object.prototype
    }

    /**
     * Returns true if the object contains any primitive value that is true, above zero or longer than zero.
     * @param object
     */
    static hasValidProps(object: any): boolean {
        if(object && typeof object == 'object') {
            for(const [prop, value] of Object.entries(object)) {
                switch(typeof value) {
                    case 'number': if(value > 0) return true; break;
                    case 'boolean': if(value) return true; break;
                    case 'string': if(value.trim().length > 0) return true; break
                    default: if(this.hasValidProps(value)) return true
                }
            }
        }
        return false
    }

    static reload() {
        window.location.reload()
    }

    static async sleep(delayMs: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, delayMs)
        })
    }

    /**
     * Only works with a-z
     * @param str
     */
    static splitOnCaps(str: string): string[] {
        return str.split(/(?=[A-Z][a-z])/)
    }

    static nameToSentence(str: string, lowerCase: boolean = false): string {
        const sentence = this.splitOnCaps(str).join(' ').replace('_', ' ')
        return lowerCase ? sentence.toLowerCase() : sentence
    }

    static camelToTitle(str: string, option = EUtilsTitleReturnOption.Everything): string {
        // (1) Split on a uppercase letter
        // (2) if the preceding character is...
        //   (3) lowercase
        //   OR
        //   (4) uppercase with another uppercase character before it and not the last lowercase letter after.
        //                   ((2)( 3 )|(         4         ))(  1  )
        const detectWords = /(?<=[a-z]|[A-Z](?=[A-Z][a-z]^$))([A-Z])/g
        const splitOnWords = /[\W_]/g
        str = str.replace(detectWords, ' $1')
        const arr = str.split(splitOnWords)
        if(arr.length > 1) switch(option) {
            case EUtilsTitleReturnOption.OnlyFirstWord:
                arr.splice(1)
                break;
            case EUtilsTitleReturnOption.SkipFirstWord:
                arr.shift()
                break;
        }
        if(arr.length > 0) arr[0] = this.capitalize(arr[0])
        return arr.join(' ')
    }
    static capitalize(str: string): string {
        return str.length > 0 ? str[0].toUpperCase()+str.slice(1) : str
    }

    /**
     * Will return the converted ASCII text if valid, else undefined.
     * @param binary
     */
    static binaryAsciiToText(binary: string): string|undefined {
        if(binary.length%8 !== 0) return
        const groups = binary.match(/.{8}/g)
        if(!groups) return
        let result = ""
        for(const group of groups) {
            const asciiCode = parseInt(group,2)
            if(isNaN(asciiCode)) return
            const char = String.fromCharCode(asciiCode)
            if(char.length == 0) return
            result += char
        }
        return result
    }

    /**
     * Will return the converted HEX code as string if valid, else undefined.
     * @param binary
     */
    static binaryToHexText(binary: string): string|undefined {
        if(binary.length%4 !== 0) return
        const groups = binary.match(/.{4}/g)
        if(!groups) return
        let result = ""
        for(const group of groups) {
            const num = parseInt(group , 2)
            if(isNaN(num) || num < 0 || num > 15) return
            result += num.toString(16)
        }
        return result
    }
    static escapeHTML(html: string): string {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '\\n') // Seems we cannot escape just \ as it's part of \n
            .replace(/\t/g, '\\t')
    }
    static unescapeHTML(html: string): string {
        return html
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
    }

    static async writeToClipboard(data: any|undefined): Promise<boolean> {
        if(data === undefined) return false
        const value = typeof data == 'string' ? data : JSON.stringify(data)
        try {
            await navigator.clipboard.writeText(value);
            return true
        } catch (err) {
            return false
        }
    }

    static async readFromClipboard(parseJson: boolean = false): Promise<any|undefined> {
        try {
            const data = await navigator.clipboard.readText();
            return parseJson ? JSON.parse(data) : data;
        } catch (err) {
            return undefined
        }
    }

    /**
     * Moves an element in place in an array.
     * @param arr
     * @param fromIndex
     * @param toIndex
     */
    static moveInArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
        const newIndex = Math.max(0, Math.min(arr.length-1, toIndex))
        const [item] = arr.splice(fromIndex, 1)
        if(item !== undefined) arr.splice(newIndex, 0, item)
        return arr
    }

    /**
     * Returns an object where the properties have been rearranged.
     * @param obj
     * @param fromProperty
     * @param toProperty
     */
    static moveInDictionary(obj: object, fromProperty: string, toProperty: string): object {
        const keys = Object.keys(obj)
        const fromIndex = keys.indexOf(fromProperty)
        const toIndex = keys.indexOf(toProperty)
        let entries = Object.entries(obj)
        if(toIndex > -1 && fromIndex > -1) {
            entries = this.moveInArray(entries, fromIndex, toIndex)
        }
        return Object.fromEntries(entries)
    }

    static getUrlParams(): URLSearchParams {
        const queryString = window.location.search
        return new URLSearchParams(queryString)
    }

    /**
     * Takes any number of strings, will return the first non-empty string.
     * It verifies type and length for every value until there is a match.
     * @param values
     */
    static getFirstValidString(...values: any[]): string {
        for(const value of values) {
            if(typeof value === 'string') {
                if(value.trim().length > 0) return value
            }
        }
        return ''
    }

    static setUrlParam(pairs: { [param: string]: string }) {
        const urlParams = Utils.getUrlParams()
        for(const [param, value] of Object.entries(pairs)) {
            urlParams.set(param, value)
        }
        window.history.replaceState(null, '', `?${urlParams.toString()}`);
    }

    /**
     * Check if the string is a color, currently supports:
     *  rgb()
     *  rgba()
     *  #000-#00000000
     * @param color
     */
    static isColor(color: any):boolean {
        const colorRegex = /(^#[a-f0-9]{3,8}$)|(^rgba?\(.*?\)$)/i;
        return typeof color == 'string'
            && (
                colorRegex.test(color)
                || (Object.values(Color) as string[]).indexOf(color.toLowerCase()) > -1
            )
    }

    static isImage(contentType: any) {
        // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
        const validTypes = ['image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
        return typeof contentType == 'string' && validTypes.indexOf(contentType) > -1
    }

    static isAudio(contentType: any) {
        const validTypes = ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/aacp', 'audio/ogg', 'audio/webm', 'audio/x-caf', 'audio/flac']
        return typeof contentType == 'string' && validTypes.indexOf(contentType) > -1
    }

    static ensureTrailingSlash(path: string): string {
        if(path.split('/').length > path.split('\\').length) {
            return this.ensureStringTail(path, '/')
        } else {
            return this.ensureStringTail(path, '\\')
        }
    }
    static ensureStringTail(value: string, tail: string): string {
        if(!value.endsWith(tail)) return `${value}${tail}`
        else return value
    }

    static toRegExp(rxStr: string): RegExp {
        try {
            const arr = rxStr.split('/')
            if(arr.length >= 3) { // A valid string should split into at least three parts as it should have at least two slashes
                const flags = arr.pop()
                const pattern = arr.filter((str)=>str).join('/')
                return new RegExp(pattern, flags)
            }
        } catch (e) {
            console.warn('Exception trying to create regular expression', e)
        }
        return new RegExp(rxStr)
    }
}

// Tip from the TS Discord, ended up not using it, possibly useful later?
export type TJson =
    | boolean
    | number
    | string
    | null
    | readonly TJson[]
    | { readonly [key: string]: TJson }

export enum EUtilsTitleReturnOption {
    Everything,
    OnlyFirstWord,
    SkipFirstWord
}