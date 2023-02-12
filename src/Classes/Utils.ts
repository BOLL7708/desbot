import Config from './Config.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import {TKeys} from '../_data/!keys.js'
import {IActionUser, ITextTags} from '../Interfaces/iactions.js'
import SteamStoreHelper from './SteamStoreHelper.js'
import {IEvent, IEventsConfig} from '../Interfaces/ievents.js'
import {ITwitchEmotePosition} from '../Interfaces/itwitch_chat.js'
import {LOCAL_STORAGE_AUTH_KEY} from './DataUtils.js'
import DataBaseHelper from './DataBaseHelper.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'
import {ITwitchHelixUsersResponseData} from '../Interfaces/itwitch_helix.js'
import {ConfigCleanText} from '../Objects/Config/CleanText.js'
import {ConfigSpeech} from '../Objects/Config/Speech.js'
import {SettingUserName, SettingUserVoice} from '../Objects/Setting/User.js'
import {SettingTwitchCheer, SettingTwitchReward, SettingTwitchSub} from '../Objects/Setting/Twitch.js'
import {SettingAccumulatingCounter} from '../Objects/Setting/Counters.js'

export default class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        const [first, ...rest] = str.split(needle)
        return rest ? [first, rest.join(needle)] : [first]
    }

    static async loadCleanName(userIdOrName: string|number):Promise<string> {
        let userData: ITwitchHelixUsersResponseData|undefined
        if(typeof userIdOrName === 'string') {
            userData = isNaN(parseInt(userIdOrName))
                ? await TwitchHelixHelper.getUserByLogin(userIdOrName)
                : await TwitchHelixHelper.getUserById(userIdOrName)
        } else {
            userData = await TwitchHelixHelper.getUserById(userIdOrName)
        }
        const userId = userData?.id ?? ''
        const userName = userData?.login ?? ''
        let cleanNameSetting = await DataBaseHelper.load(new SettingUserName(), userId)
        let cleanName = cleanNameSetting?.shortName ?? userName
        if(!cleanName) {
            cleanName = this.cleanName(userName)
            const cleanNameSetting = new SettingUserName()
            cleanNameSetting.shortName = cleanName
            cleanNameSetting.datetime = Utils.getISOTimestamp()
            await DataBaseHelper.save(cleanNameSetting, userId)
        }
        return cleanName
    }

    static cleanName(name:string): string {
        // Check if the name is a binary string and try to convert it to something reasonable.
        const binaryRegExp = new RegExp(/^[0-1]+$/)
        if(binaryRegExp.test(name)) {
            const hex = this.binaryToHexText(name)
            const ascii = this.binaryAsciiToText(name)
            const usernameCharsRegExp = new RegExp(/^[a-zA-Z0-9_]+$/)
            if(ascii !== undefined && usernameCharsRegExp.test(ascii)) name = ascii
            else if(hex !== undefined && usernameCharsRegExp.test(hex)) name = hex
        }

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
        let re = new RegExp(Object.keys(numToChar).join("|"),"gi");
        let result = namePart.replace(re, function(matched){
            return numToChar[parseInt(matched)];
        });

        // If name ended up empty, return the original name
        return result.length > 0 ? result : name
    }

    static async cleanText(textInput:string|undefined, config?: ConfigCleanText, clearRanges:ITwitchEmotePosition[]=[]):Promise<string> {
        if(textInput == undefined || textInput.length == 0) return ''
        let text = textInput ?? ''

        if(!config) {
            const ttsConfig = await DataBaseHelper.loadMain(new ConfigSpeech())
            config = ttsConfig.cleanTextConfig
        }
        if(!config?.keepCase) text = text.toLowerCase()

        // Remove Twitch emojis
        if(clearRanges.length > 0) clearRanges.forEach(range => {
            const charArr = [...text]
            text = charArr.slice(0, range.start).join('') + charArr.slice(range.end+1).join('');
        })
        
        // Clear bit emojis
        if(config?.removeBitEmotes) {
            let bitMatches = text.match(/(\S+\d+)+/g) // Find all [word][number] references to clear out bit emotes
            if(bitMatches != null) bitMatches.forEach(match => text = text.replace(match, ' '))
        }

        // Remove things in ()
        if(config?.removeParentheses) {
            text = text.replace(/(\(.*\))/g, '')
        }

		// Replace more than one period with ellipsis, or else TTS will say "dot" from ".." if reduce repeated characters is on.
        text = text.replace(/([\.]{2,})/g, '…')

        // Reduce XXX...XXX to XX
        if(config?.reduceRepeatedCharacters) {
            const repeatCharMatches = text.match(/(\D)\1{2,}/g) // 2+ len group of any repeat non-digit https://stackoverflow.com/a/6306113
            if(repeatCharMatches != null) repeatCharMatches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        }
        
        // Replace numbers of more than 7 digits to just big number.
        if(config?.replaceBigNumbers) {
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
                if(config?.replaceUserTags) {
                    let cleanName = await Utils.loadCleanName(match.substring(1).toLowerCase())
                    text = text.replace(match, cleanName)
                } else {
                    text = text.replace(match, untaggedName)
                }
            }
        }

        if(config?.replaceLinks) {
            // Links: https://stackoverflow.com/a/23571059/2076423
            text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, config.replaceLinksWith ?? 'link')
        }

        // TODO: This might remove more symbols than emojis, not sure if that is something to fix.
        if(config?.removeUnicodeEmojis) {
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
        return setting.trim().replace(/[|;]/g, ' ')
    }

    static async sha256(message: string) {
        const textBuffer = new TextEncoder().encode(message); // encode as UTF-8
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer); // hash the message
        const byteArray = Array.from(new Uint8Array(hashBuffer)); // convert ArrayBuffer to Array
        return btoa(String.fromCharCode(...byteArray));
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
     * @param userData
     * @param extraTags
     * @returns
     */
    static async replaceTagsInTextArray(texts: string[]|undefined, userData?: IActionUser, extraTags: { [key:string]: string } = {}): Promise<string[]> {
        if(!texts) return []
        const result: string[] = []
        for(const text of texts) {
            result.push(await this.replaceTagsInText(text, userData, extraTags))
        }
        return result
    }

    /**
     * Replaces certain tags in strings used in events.
     * @param text
     * @param userData
     * @param extraTags
     * @returns
     */
    static async replaceTagsInText(text: string|undefined, userData?: IActionUser, extraTags: { [key:string]: string } = {}): Promise<string> {
        if(!text) return ''
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        // Default tags from incoming user data
        const tags = await this.getDefaultTags(userData)

        // Game tags
        if(text.includes('%game')) {
            if(states.lastSteamAppId) {
                const steamGameMeta = await SteamStoreHelper.getGameMeta(states.lastSteamAppId)
                tags.gameId = states.lastSteamAppId ?? 'N/A'
                tags.gameLink = SteamStoreHelper.getStoreURL(states.lastSteamAppId)
                if(steamGameMeta) {
                    tags.gamePrice = SteamStoreHelper.getPrice(steamGameMeta)
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
            // Get the fist user tag or if the last word in the input is a link we expect it's a twitch channel link.
            const word = userData?.input?.split(' ')?.shift()
            const link = word?.includes('https://') ? word.split('/').pop() ?? '' : ''
            let userLogin = this.getFirstUserTagInText(userData?.input ?? '') ?? link

            // If we have a possible login, get the user data, if they exist
            const channelData = await TwitchHelixHelper.getChannelByName(userLogin)
            if(channelData) {
                const voice = await DataBaseHelper.load(new SettingUserVoice(), channelData.broadcaster_id)
                tags.targetId = channelData.broadcaster_id
                tags.targetLogin = channelData.broadcaster_login
                tags.targetName = channelData.broadcaster_name
                tags.targetTag = `@${channelData.broadcaster_name}`
                tags.targetNick = await this.loadCleanName(channelData.broadcaster_id)
                tags.targetGame = channelData.game_name
                tags.targetTitle = channelData.title
                tags.targetLink = `https://twitch.tv/${channelData.broadcaster_login}`
                tags.targetColor = await TwitchHelixHelper.getUserColor(channelData.broadcaster_id) ?? ''
                tags.targetVoice = this.getVoiceString(voice)
            }
        }

        tags.targetOrUserId = tags.targetId.length > 0 ? tags.targetId : tags.userId
        tags.targetOrUserLogin = tags.targetLogin.length > 0 ? tags.targetLogin : tags.userLogin
        tags.targetOrUserName = tags.targetName.length > 0 ? tags.targetName : tags.userName
        tags.targetOrUserTag = tags.targetTag.length > 0 ? tags.targetTag : tags.userTag
        tags.targetOrUserNick = tags.targetNick.length > 0 ? tags.targetNick : tags.userNick
        tags.targetOrUserColor = tags.targetColor.length > 0 ? tags.targetColor : tags.userColor
        tags.targetOrUserVoice = tags.targetVoice.length > 0 ? tags.targetVoice : tags.userVoice

        // Apply tags and return
        return this.replaceTags(text, {...tags, ...extraTags})
    }

    private static async getDefaultTags(userData?: IActionUser): Promise<ITextTags> {
        const states = StatesSingleton.getInstance()
        const userIdStr = userData?.id?.toString() ?? ''
        const subs = await DataBaseHelper.load(new SettingTwitchSub(), userIdStr)
        const cheers = await DataBaseHelper.load(new SettingTwitchCheer(), userIdStr)
        const voice = await DataBaseHelper.load(new SettingUserVoice(), userIdStr)
        const now = new Date()

        const eventConfig = Utils.getEventConfig(userData?.eventKey)
        const eventLevel = states.multiTierEventCounters.get(userData?.eventKey ?? '')?.count ?? 0
        const eventLevelMax = eventConfig?.options?.multiTierMaxLevel ?? Utils.ensureArray(eventConfig?.triggers?.reward).length
        const eventCount = (await DataBaseHelper.load(new SettingAccumulatingCounter(), userData?.eventKey ?? ''))?.count ?? 0
        const eventGoal = eventConfig?.options?.accumulationGoal ?? 0

        const userBits = (userData?.bits ?? 0) > 0
            ? userData?.bits?.toString() ?? '0'
            : cheers?.lastBits ?? '0'
        const userBitsTotal = (userData?.bitsTotal ?? 0) > 0
            ? userData?.bitsTotal?.toString() ?? '0'
            : cheers?.totalBits ?? '0'

        const result = <ITextTags> {
            // region User
            userId: userIdStr,
            userLogin: userData?.login ?? '',
            userName: `${userData?.name}`,
            userTag: `@${userData?.name}`,
            userNick: await this.loadCleanName(userData?.id ?? ''),
            userMessage: userData?.message ?? '',
            userInput: '',
            userInputHead: '',
            userInputRest: '',
            userInputTail: '',
            userInputNoTags: '',
            userInputNumber: '',
            userInputTag: '',
            userBits: userBits,
            userBitsTotal: userBitsTotal,
            userSubsTotal: subs?.totalMonths ?? '0',
            userSubsStreak: subs?.streakMonths ?? '0',
            userColor: userData?.color ?? '',
            userVoice: this.getVoiceString(voice),
            // endregion

            // region Target
            targetId: '',
            targetLogin: '',
            targetName: '',
            targetTag: '',
            targetNick: '',
            targetGame: '',
            targetTitle: '',
            targetLink: '',
            targetColor: '',
            targetVoice: '',
            // endregion

            // region Target or User
            targetOrUserId: '',
            targetOrUserLogin: '',
            targetOrUserName: '',
            targetOrUserTag: '',
            targetOrUserNick: '',
            targetOrUserColor: '',
            targetOrUserVoice: '',
            // endregion

            // region Game
            gameId: '',
            gamePrice: '',
            gameLink: '',
            gameName: '',
            gameInfo: '',
            gameDeveloper: '',
            gamePublisher: '',
            gameBanner: '',
            gameRelease: '',
            // endregion

            // region Time
            nowDate: now.toLocaleDateString('sv-SE'),
            nowTime: now.toLocaleTimeString('sv-SE'),
            nowTimeMs: now.toLocaleTimeString('sv-SE')+'.'+now.getMilliseconds(),
            nowDateTime: now.toLocaleString('sv-SE'),
            nowDateTimeMs: now.toLocaleString('sv-SE')+'.'+now.getMilliseconds(),
            nowISO: now.toISOString(),
            // endregion

            // region Accumulating reward
            eventKey: userData?.eventKey,
            eventCost: userData?.rewardCost ?? '0',
            eventCount: eventCount.toString(),
            eventCountPercent: (eventCount !== 0 && eventGoal !== 0)
                ? Math.round((eventCount / eventGoal) * 100)+'%'
                : '0%',
            eventGoal: eventGoal.toString(),
            eventGoalShort: Utils.formatShortNumber(eventGoal, false),
            // endregion

            // region MultiTier reward
            eventLevel: eventLevel.toString(),
            eventLevelNext: (eventLevel+1).toString(),
            eventLevelMax: eventLevelMax.toString(),
            eventLevelProgress: `${eventLevel}/${eventLevelMax}`,
            eventLevelNextProgress: `${eventLevel+1}/${eventLevelMax}`
            // endregion
        }
        if(typeof userData?.input === 'string') {
            const inputWordsClone = Utils.clone(userData.inputWords)
            result.userInput = userData.input
            result.userInputHead = inputWordsClone.shift() ?? ''
            result.userInputRest = inputWordsClone.join(' ')
            result.userInputTail = inputWordsClone.pop() ?? ''
            result.userInputNoTags = userData.input.replace(/@\w+/g, '')
            result.userInputNumber = parseFloat(userData.input).toString()
            result.userInputTag = Utils.getFirstUserTagInText(userData.input) ?? ''
            result.userInputWord1 = userData.inputWords[0] ?? ''
            result.userInputWord2 = userData.inputWords[1] ?? ''
            result.userInputWord3 = userData.inputWords[2] ?? ''
            result.userInputWord4 = userData.inputWords[3] ?? ''
            result.userInputWord5 = userData.inputWords[4] ?? ''
        }
        return { ...result, ...StatesSingleton.getInstance().textTagCache }
    }

    static getVoiceString(voiceData: SettingUserVoice|undefined): string {
        const voiceName = voiceData?.voiceName ?? ''
        if(voiceData) {
            return voiceName.length == 0
                ? `${voiceData.languageCode.toUpperCase()} ${voiceData.gender.toUpperCase()}`
                : `${voiceName.toUpperCase()}`
        } else return ''
    }

    static replaceTags(text: string|string[]|undefined, replace: { [key: string]: string }) {
        if(!text) return ''
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

    static ensureArray<Type>(value: Type[]|Type|undefined): Type[] {
        if(value === undefined) return []
        return Array.isArray(value) ? value : [value]
    }

    static ensureValue<Type>(value: Type|Type[]): Type|undefined {
        return (Array.isArray(value) && value.length > 0) ? value.shift() : <Type> value
    }

    static async getRewardId(key: TKeys): Promise<string|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.key === key})
        return reward?.id
    }
    static async getRewardKey(id: string): Promise<TKeys|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.id === id})
        return reward?.key
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
     * Get all event keys
     * @param onlyRewards
     * @returns
     */
    static getAllEventKeys(onlyRewards: boolean): TKeys[] {
        if(onlyRewards) {
            const rewardEvents = (Object.entries(Config.events) as [TKeys, IEvent][])
                .filter(e => e[1].triggers.reward !== undefined)
            return rewardEvents.map(e => e[0])
        }
        return Object.keys(Config.events) as TKeys[]
    }

    /**
     * Lists the event keys of main events that are used for custom game events.
     * @param onlyRewards
     * @returns 
     */
    static getAllEventKeysForGames(onlyRewards: boolean): TKeys[] {
        const allEventKeysForGames = (Object.entries(Config.eventsForGames) as [TKeys, IEvent][])
            .map(event => event[1])
            .flatMap(event => Object.keys(event))
        const uniqueKeys = [...new Set(allEventKeysForGames)] as TKeys[]
        if(onlyRewards) {
			const rewardEvents = (Object.entries(Config.events) as [TKeys, IEvent][])
                .filter(event => event[1].triggers.reward !== undefined)
            const rewardEventKeys = rewardEvents.map(e => e[0])
			return rewardEventKeys.filter((key => uniqueKeys.indexOf(key) > -1))
        }
        return uniqueKeys
    }

    /**
     * Get event config from any pool
     */
    static getEventConfig(key: TKeys|undefined): IEvent|undefined {
        if(key === undefined) return undefined
        return Config.events[key] ?? undefined
    }

    static getEventForGame(key: TKeys, appId: string): IEvent|undefined {
        const events = this.getEventsForGame(appId)
        if(events) return events[key]
        else return undefined
    }

    static getEventsForGame(appId: string): IEventsConfig|undefined {
        return Config.eventsForGames[appId]
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
        return localStorage.getItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder()) ?? ''
    }
    static getAuthInit(additionalHeaders: HeadersInit = {}): RequestInit {
        return {
            headers: {Authorization: Utils.getAuth(), ...additionalHeaders}
        }
    }
    static clearAuth(): void {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder())
    }

    static getCurrentFolder(): string {
        const pathArray = window.location.pathname.split('/');
        let pathItem = '.'
        while(pathArray.length && pathItem.includes('.')) {
            pathItem = pathArray.pop() ?? ''
        }
        return pathItem
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

    static async getRewardPairs(): Promise<IRewardData[]> {
        const rewards = await DataBaseHelper.loadAll(new SettingTwitchReward()) ?? {}
        const rewardPairs: IRewardData[] = []
        for(const [id, obj] of Object.entries(rewards) as [string, SettingTwitchReward][]) {
            rewardPairs.push({key: obj.key as TKeys, id: id})
        }
        return rewardPairs;
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

    static camelToTitle(str: string, removeHead: boolean = false): string {
        const arr = this.splitOnCaps(str)
        if(removeHead) return arr.splice(1).join(' ')
        else return arr.map((s)=>{return this.capitalize(s)}).join(' ')
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

    static moveInArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
        const newIndex = Math.max(0, Math.min(arr.length-1, toIndex))
        const [item] = arr.splice(fromIndex, 1)
        if(item) arr.splice(newIndex, 0, item)
        return arr
    }
    static moveStepsInArray<T>(arr: T[], fromIndex: number, steps: number): T[] {
        if (steps == 0 || arr.length == 0) return arr
        return this.moveInArray(arr, fromIndex, fromIndex+steps)
    }
}

interface IRewardData {
    key: TKeys
    id: string
}

// Tip from the TS Discord, ended up not using it, possibly useful later?
export type TJson =
    | boolean
    | number
    | string
    | null
    | readonly TJson[]
    | { readonly [key: string]: TJson }