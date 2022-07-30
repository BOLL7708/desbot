class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        const [first, ...rest] = str.split(needle)
        return rest ? [first, rest.join(needle)] : [first]
    }

    static async loadCleanName(userName:string):Promise<string> {
        let cleanNameSetting = await Settings.pullSetting<IUserName>(Settings.TTS_USER_NAMES, 'userName', userName)
        let cleanName = cleanNameSetting?.shortName
        if(cleanName == null) {
            cleanName = this.cleanName(userName)
            cleanNameSetting = {userName: userName, shortName: cleanName, editor: '', datetime: Utils.getISOTimestamp()}
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
        let numToChar:{[key: number]: string} = {
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
            return numToChar[parseInt(matched)];
        });

        // If name ended up empty, return the original name
        return result.length > 0 ? result : name
    }

    static async cleanText(text:string, config: ICleanTextConfig, clearRanges:ITwitchEmotePosition[]=[]):Promise<string> {
        if(!config.keepCase) text = text.toLowerCase()

        // Remove Twitch emojis
        if(clearRanges.length > 0) clearRanges.forEach(range => {
            const charArr = [...text]
            text = charArr.slice(0, range.start).join('') + charArr.slice(range.end+1).join('');
        })
        
        // Clear bit emojis
        if(config.removeBitEmotes) {
            let bitMatches = text.match(/(\S+\d+)+/g) // Find all [word][number] references to clear out bit emotes
            if(bitMatches != null) bitMatches.forEach(match => text = text.replace(match, ' '))
        }

        // Remove things in ()
        if(config.removeParantheses) {
            text = text.replace(/(\(.*\))/g, '')
        }

		// Replace more than one period with ellipsis, or else TTS will say "dot" from ".." if reduce repeated characters is on.
        text = text.replace(/([\.]{2,})/g, '…')

        // Reduce XXX...XXX to XX
        if(config.reduceRepeatedCharacters) {
            const repeatCharMatches = text.match(/(\D)\1{2,}/g) // 2+ len group of any repeat non-digit https://stackoverflow.com/a/6306113
            if(repeatCharMatches != null) repeatCharMatches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        }
        
        // Replace numbers of more than 7 digits to just big number.
        if(config.replaceBigNumbers) {
            const bigNumberDigits = config.replaceBigNumbersWithDigits ?? 7;
            const bigNumberRegex = new RegExp(`(\\d){${bigNumberDigits},}`, 'g')
            text = text.replace(bigNumberRegex, config.replaceBigNumbersWith ?? 'big number') // 7+ len group of any mixed digits
        }

        // Detect name tags and replace them with their clean name
        let tagMatches = text.match(/(@\w+)+/g) // Matches every whole word starting with @
        if(tagMatches != null) { // Remove @ and clean
            for(let i=0; i<tagMatches.length; i++) {
                let match = tagMatches[i]
                let untaggedName = match.substring(1)
                if(config.replaceUserTags) {
                    let cleanName = await Utils.loadCleanName(match.substring(1).toLowerCase())
                    text = text.replace(match, cleanName)
                } else {
                    text = text.replace(match, untaggedName)
                }
            }
        }

        if(config.replaceLinks) {
            // Links: https://stackoverflow.com/a/23571059/2076423
            text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, config.replaceLinksWith ?? 'link')
        }

        // TODO: This might remove more symbols than emojis, not sure if that is something to fix.
        if(config.removeUnicodeEmojis) {
            // Emojis: https://stackoverflow.com/a/63464318/2076423
            // text = text.replace(/[\p{Emoji_Presentation}]/gu, '')
            // text = text.replace(/[^\p{Letter}\p{Number}\p{Punctuation}\p{Separator}\p{Symbol}]/gu, '')
            text = text.replace(/[^\p{L}\p{N}\p{P}\p{Z}{\^\$}]/gu, '') 
        }

        return text
            .replace(/(\s+)\1{1,}/g, ' ') // spans of spaces to single space
            .trim()
    }

    static cleanUserName(userName: string) {
        return userName.trim().replace('@', '').toLowerCase()
    }

    static cleanSetting(setting: string) {
        return setting.trim().replace('|', ' ').replace(';', ' ')
    }

    static async sha256(message: string) {
        const textBuffer = new TextEncoder().encode(message); // encode as UTF-8
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer); // hash the message
        const byteArray = Array.from(new Uint8Array(hashBuffer)); // convert ArrayBuffer to Array
        let base64String = btoa(String.fromCharCode(...byteArray)); // b64 encode byte array
        return base64String;
    }

    static b64toBlob = (b64Data: string, contentType='image/png', sliceSize=512) => {
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

    static b64ToDataUrl(b64data: string, contentType='image/png'):string {
        return `data:${contentType};base64,${b64data}`
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
        return `${tag}-${Date.now()}`
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
     * Replaces certain tags in strings used in events.
     * @param text
     * @param message
     * @returns
     */
    static async replaceTagsInText(text: string, userData?: IActionUser, extraTags: { [key:string]: string } = {}) {
        if(typeof text !== 'string') {
            console.warn(`Utils.replaceTagsInText: text is not a string: (${typeof text})`)
            return ''
        }
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        // Default tags from incoming user data
        const tags = await this.getDefaultTags(userData)

        // Game tags
        if(text.includes('%game')) {
            if(states.lastSteamAppId) {
                const steamGameMeta = await SteamStore.getGameMeta(states.lastSteamAppId)
                tags.gameId = states.lastSteamAppId ?? 'N/A'
                tags.gameLink = SteamStore.getStoreURL(states.lastSteamAppId)
                if(steamGameMeta) {
                    tags.gamePrice = SteamStore.getPrice(steamGameMeta)
                    tags.gameName = steamGameMeta.name ?? 'N/A'
                    tags.gameInfo = steamGameMeta.short_description ?? 'N/A'
                    tags.gameDeveloper = steamGameMeta.developers?.join(', ') ?? 'N/A'
                    tags.gamePublisher = steamGameMeta.publishers?.join(', ') ?? 'N/A'
                    tags.gameBanner = steamGameMeta.header_image ?? ''
                    tags.gameRelease = steamGameMeta.release_date?.date ?? 'N/A'
                }
            }
        }

        // Target tags
        if(text.includes('%target')) {
            let userLogin = 
                this.getFirstUserTagInText(userData?.input ?? '') // @-tag
                ?? userData?.input?.split(' ')?.shift() // Just first word
                ?? ''
            
            // Was it a full link? If so use last word after /
            if(userLogin.includes('https://')) userLogin = userLogin.split('/').pop() ?? ''
            
            // If we have a possible login, get the user data, if they exist
            if(userLogin) {
                const channelData = await modules.twitchHelix.getChannelByName(userLogin)
                if(channelData) {
                    tags.targetLogin = channelData.broadcaster_login
                    tags.targetName = channelData.broadcaster_name
                    tags.targetTag = `@${channelData.broadcaster_name}`
                    tags.targetNick = await this.loadCleanName(channelData.broadcaster_login)
                    tags.targetGame = channelData.game_name
                    tags.targetTitle = channelData.title
                    tags.targetLink = `https://twitch.tv/${channelData.broadcaster_login}`
                    tags.targetColor = await modules.twitchHelix.getUserColor(channelData.broadcaster_id) ?? ''
                }
            }
        }

        // Apply tags and return
        return this.replaceTags(text, {...tags, ...extraTags})
    }

    private static async getDefaultTags(userData?: IActionUser): Promise<ITextTags> {
        const subs = await Settings.pullSetting<ITwitchSubSetting>(Settings.TWITCH_USER_SUBS, 'userName', userData?.login)
        const cheers = await Settings.pullSetting<ITwitchCheerSetting>(Settings.TWITCH_USER_CHEERS, 'userName', userData?.login)        
        const userBits = (userData?.bits ?? 0) > 0 
            ? userData?.bits?.toString() ?? '0'
            : cheers?.lastBits ?? '0'
        const userBitsTotal = (userData?.bitsTotal ?? 0) > 0
            ? userData?.bitsTotal?.toString() ?? '0'
            : cheers?.totalBits ?? '0'
        const result = {
            userLogin: userData?.login ?? '',
            userName: `${userData?.name}`,
            userTag: `@${userData?.name}`,
            userNick: await this.loadCleanName(userData?.login ?? ''),
            userInput: '',
            userInputHead: '',
            userInputRest: '',
            userInputTail: '',
            userInputNumber: '',
            userBits: userBits,
            userBitsTotal: userBitsTotal,
            userSubsTotal: subs?.totalMonths ?? '0',
            userSubsStreak: subs?.streakMonths ?? '0',
            userColor: userData?.color ?? '',

            gameId: '',
            gamePrice: '',
            gameLink: '',
            gameName: '',
            gameInfo: '',
            gameDeveloper: '',
            gamePublisher: '',
            gameBanner: '',
            gameRelease: '',

            targetLogin: '',
            targetName: '',
            targetTag: '',
            targetNick: '',
            targetGame: '',
            targetTitle: '',
            targetLink: '',
            targetColor: ''
        }
        if(userData?.input) {
            const input = userData.input
            const inputSplit = input.split(' ')
            result.userInput = input
            result.userInputHead = inputSplit.shift() ?? ''
            result.userInputRest = inputSplit.join(' ')
            result.userInputTail = inputSplit.pop() ?? result.userInputHead // If the array is already empty, head & tail are the same.
            result.userInputNumber = parseFloat(input).toString()
        }
        return result
    }

    static replaceTags(text: string|string[], replace: { [key: string]: string }) {
        if(Array.isArray(text)) text = Utils.randomFromArray(text)
        for(const key of Object.keys(replace)) {
            const rx = new RegExp(`\%${key}([^a-zA-Z]|$)`, 'g') // Match the key word and any non-character afterwards
            text = text.replace(rx, `${replace[key]}$1`) // $1 is whatever we matched in the group that was not text}
        }
        return text
    }

    static getFirstUserTagInText(text: string): string|undefined {
        const match = text.match(/@(\w+)/)
        return match?.[1] ?? undefined
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

    static ensureArray<Type>(value: Type[]|Type): Type[] {
        return Array.isArray(value) ? value : [value]
    }

    static ensureValue<Type>(value: Type|Type[]): Type|undefined {
        return (Array.isArray(value) && value.length > 0) ? value.shift() : <Type> value
    }

    static async getRewardId(key: string): Promise<string|undefined> {
        const reward = await Settings.pullSetting<ITwitchRewardPair>(Settings.TWITCH_REWARDS, 'key', key)
        return reward?.id
    }

    static encode(value: string): string {
        let b64 = btoa(value)
        let b64url = b64.replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '')
        return b64url
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
        return JSON.parse(JSON.stringify(data))
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
     */
    static toInt(intStr: string|undefined, defaultValue: number = NaN): number {
        return parseInt(intStr ?? '') || defaultValue
    }

    /**
     * Get all event keys
     * @param onlyRewards
     * @returns
     */
    static getAllEventKeys(onlyRewards: boolean): string[] {
        // TODO: Return all keys that are for events with reward configs?
        if(onlyRewards) {
            const rewardEvents = Object.entries(Config.events).filter(e => e[1].triggers.reward !== undefined)
            return rewardEvents.map(e => e[0])
        }
        return Object.keys(Config.events)
    }

    /**
     * Lists the event keys that are for events that are used for the events that are modified on a per game basis.
     * @param onlyRewards
     * @returns 
     */
    static getAllEventKeysForGames(onlyRewards: boolean): string[] {
        const allEventKeysForGames = Object.entries(Config.eventsForGames).map(e => e[1]).flatMap(e => Object.keys(e))
        const uniqueKeys = allEventKeysForGames.filter((value, index, array) => array.indexOf(value) === index)
        if(onlyRewards) {
			const rewardEvents = Object.entries(Config.events).filter(e => e[1].triggers.reward !== undefined)
            const rewardEventKeys = rewardEvents.map(e => e[0])
			return rewardEventKeys.filter((key => uniqueKeys.indexOf(key) > -1))
        }
        return uniqueKeys
    }

    /**
     * Get event config from any pool
     */
    static getEventConfig(key: string): IEvent|undefined {
        return Config.events[key]
    }

    static getEventsForGame(key: string): { [key: string]: IEvent }|undefined {
        return Config.eventsForGames[key]
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

    static hasNumberKeys(obj: object): boolean {
        const keys = Object.keys(obj)
        const numberedKeys = keys.filter((key) => !isNaN(parseInt(key)))
        return keys.length == numberedKeys.length
    }

    static getTimelineFromActions(actions: IActions|IActionsTimeline|undefined): IActionsTimeline {
        return actions && !Utils.hasNumberKeys(actions)
            ? <IActionsTimeline> {0: actions}
            : (actions && Object.keys(actions).length > 0)
                ? <IActionsTimeline> actions
                : {0: {}}
    }
}