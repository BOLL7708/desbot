class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        let [first, ...rest] = str.split(needle)
        return [first, rest.join(needle)]
    }

    static async loadCleanName(userName:string):Promise<string> {
        let cleanNameSetting:IUserName = await Settings.pullSetting(Settings.TTS_USER_NAMES, 'userName', userName)
        let cleanName = cleanNameSetting?.shortName
        if(cleanName == null) {
            cleanName = this.cleanName(userName)
            cleanNameSetting = {userName: userName, shortName: cleanName}
            Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', cleanNameSetting)
        }
        return cleanName
    }

    static cleanName(name:string):string {
        // Split on _ and keep the longest word
        let nameArr = name.toLowerCase().split('_') // Split on _
        let namePart = nameArr.reduce((a, b) => a.length > b.length ? a : b) // Reduce to longest word
        
        // Remove big number groups (len: 2+)
        namePart = namePart.replace(/[0-9]{2,}/g, '') 
        
        // Replace single digits with letters
        let numToChar:any = {
            0: 'o',
            1: 'i',
            3: 'e',
            4: 'a',
            5: 's',
            7: 't',
            8: 'b'
        }
        var re = new RegExp(Object.keys(numToChar).join("|"),"gi");
        let result = namePart.replace(re, function(matched){
            return numToChar[matched];
        });

        // If name ended up empty, return the original name
        return result.length > 0 ? result : name
    }

    static async cleanText(text:string, clearBits:boolean=false, keepCase:boolean=false, clearRanges:ITwitchEmotePosition[]=[], cleanTags:boolean=true):Promise<string> {
        if(!keepCase) text = text.toLowerCase()

        // Remove Twitch emojis
        if(clearRanges.length > 0) clearRanges.forEach(range => {
            const charArr = [...text]
            text = charArr.slice(0, range.start).join('') + charArr.slice(range.end+1).join('');
            console.log(text)
        })
        
        // Clear bit emojis
        if(clearBits) {
            let bitMatches = text.match(/(\S+\d+)+/g) // Find all [word][number] references to clear out bit emotes
            if(bitMatches != null) bitMatches.forEach(match => text = text.replace(match, ' '))
        }

        // Reduce XXXXXX to XX
        let repeatCharMatches = text.match(/(\D)\1{2,}/g) // 2+ len group of any repeat non-digit https://stackoverflow.com/a/6306113
        if(repeatCharMatches != null) repeatCharMatches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        
        // Replace numbers of more than 7 digits to just big number.
        text = text.replace(/(\d){7,}/g, '"big number"') // 7+ len group of any mixed digits

        // Detect name tags and replace them with their clean name
        let tagMatches = text.match(/(@\w+)+/g) // Matches every whole word starting with @
        if(tagMatches != null) { // Remove @ and clean
            for(let i=0; i<tagMatches.length; i++) {
                let match = tagMatches[i]
                let untaggedName = match.substr(1)
                if(cleanTags) {
                    let cleanName = await Utils.loadCleanName(match.substr(1).toLowerCase())
                    text = text.replace(match, cleanName)
                } else {
                    text = text.replace(match, untaggedName)
                }
            }
        }

        // TODO: Add Config options for opting in/out of text cleaning?
        return text
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, 'link') // Links: https://stackoverflow.com/a/23571059/2076423
            .replace(/[^\p{L}\p{N}\p{P}\p{Z}{\^\$}]/gu, '') // Emojis: https://stackoverflow.com/a/63464318/2076423
            .replace(/(\s+)\1{1,}/g, ' ') // spans of spaces to single space
            .trim()
    }

    static cleanUserName(userName:string) {
        return userName.trim().replace('@', '').toLowerCase()
    }

    static cleanSetting(setting:string) {
        return setting.trim().replace('|', ' ').replace(';', ' ')
    }

    static async sha256(message:string) {
        const textBuffer = new TextEncoder().encode(message); // encode as UTF-8
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer); // hash the message
        const byteArray = Array.from(new Uint8Array(hashBuffer)); // convert ArrayBuffer to Array
        let base64String = btoa(String.fromCharCode(...byteArray)); // b64 encode byte array
        return base64String;
    }

    static b64toBlob = (b64Data, contentType='image/png', sliceSize=512) => {
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
    
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    static b64ToDataUrl(b64data, contentType='image/png'):string {
        return `data:${contentType};base64,${b64data}`
    }

    static hexToDecColor(hex: string): number {
        if(hex.indexOf('#') == 0) hex = hex.substr(1)
        if(hex.length == 3) hex = hex.split('').map(ch => ch+ch).join('')
        return parseInt(hex, 16)
    }

    static matchFirstChar(text:string, chars:string[]):Boolean {
        let trimmed = text.trim()
        for(let i in chars) {
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
        return `${tag}-${Date.now()}`
    }

    static logWithBold(message:string, color:string) {
        const formatNormal = `color: ${color}; font-weight: normal;`
        const formatBold = `color: ${color}; font-weight: bold;`
        var formats = [formatNormal];
        for(var i=0; i<message.length;i++) {
            if (message[i] === "<") formats.push(formatBold);
            else if (message[i] === ">") formats.push(formatNormal);
        }
        console.log(`%c${message}`.replace(/</g, '%c').replace(/>/g, '%c'), ...formats)
    }

    static log(message, color:string, bold:boolean=false, big:boolean=false) {
        let format = `color: ${color};`
        if(bold) format += 'font-weight: bold;'
        if(big) format += 'font-size: 150%;'
        console.log(`%c${message}`, format)
    }

    static template(text: string|string[], ...values):string {
        if(Array.isArray(text)) text = Utils.randomFromArray(text)
        return text.replace(/\%s/g, function(_) {
            return values.shift() ?? ''
        })
    }

    static replaceTagsInString(text:string, message: ITwitchRedemptionMessage) {
        const login = message?.redemption?.user?.login
        if(login != undefined) text = text.replace(/%name/g, ` @${login} `)
        return text
    }

    /**
     * Will return a random string from an array of strings
     * @param arr Array of strings, if not an array, will just return the string
     * @returns The random string
     */
    static randomFromArray<Type>(arr: Type[]|Type): Type {
        if(Array.isArray(arr)) return arr[Math.floor(Math.random()*arr.length)]
        else return arr
    }

    static async getRewardId(key: string): Promise<string> {
        const reward:ITwitchRewardPair = await Settings.pullSetting(Settings.TWITCH_REWARDS, 'key', key)
        return reward?.id ?? null
    }

    static encode(value: string): string {
        let b64 = btoa(value)
        let b64url = b64.replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '')
        return b64url
    }

    static numberToDiscordEmote(value: number, addHash: boolean = false): string {
        let numbers:Record<string, string> = {
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
                img.onload = function() {
                    resolve(img)
                }
                img.src = urlOrData
            } else {
                resolve(null)
            }
        })
    }
}