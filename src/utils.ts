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
        let nameArr = name.toLowerCase().split('_') // Split on _
        let namePart = nameArr.reduce((a, b) => a.length > b.length ? a : b) // Reduce to longest word
        namePart = namePart.replace(/[0-9]{2,}/g, '') // Replace big number groups (len: 2+)
        let numToChar:any = {
            0: 'o',
            1: 'i',
            3: 'e',
            4: 'a',
            5: 's',
            6: 'g',
            7: 't'
        }
        var re = new RegExp(Object.keys(numToChar).join("|"),"gi");
        let result = namePart.replace(re, function(matched){ // Replace leet speak with chars
            return numToChar[matched];
        });
        return result.length > 0 ? result : name // If name ended up empty, return original
    }

    static async cleanText(text:string, clearBits:boolean=false, keepCase:boolean=false, clearRanges:ITwitchEmotePosition[]=[], cleanTags:boolean=true):Promise<string> {
        if(!keepCase) text = text.toLowerCase()

        if(clearRanges.length > 0) clearRanges.forEach(range => {
            text = text.slice(0, range.start) + text.slice(range.end+1);
        })
        
        if(clearBits) {
            let bitMatches = text.match(/(\S+\d+)+/g) // Find all [word][number] references to clear out bit emotes
            if(bitMatches != null) bitMatches.forEach(match => text = text.replace(match, ' '))
        }

        let repeatCharMatches = text.match(/(\D)\1{2,}/g) // 2+ len group of any repeat non-digit https://stackoverflow.com/a/6306113
        if(repeatCharMatches != null) repeatCharMatches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        text = text.replace(/(\d){7,}/g, '"big number"') // 7+ len group of any mixed digits

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

    static b64toBlob = (b64Data, contentType='', sliceSize=512) => {
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
            .replace(/@/g, '(at)')
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

    static removeImageHeader(image:string) {
        const i = image.indexOf('base64,')
        return image.substr(i+7)
    }

    static getNonce(tag:string) {
        return `${tag}-${Date.now()}`
    }
}