import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import SteamStoreHelper from './SteamStoreHelper.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'
import DataBaseHelper from './DataBaseHelper.js'
import {SettingUser, SettingUserName, SettingUserVoice} from '../Objects/Setting/SettingUser.js'
import {SettingAccumulatingCounter} from '../Objects/Setting/SettingCounters.js'
import Utils from './Utils.js'
import {ITwitchHelixUsersResponseData} from '../Interfaces/itwitch_helix.js'
import {ConfigCleanText} from '../Objects/Config/ConfigCleanText.js'
import {ITwitchEmotePosition} from '../Interfaces/itwitch_chat.js'
import {ConfigSpeech} from '../Objects/Config/ConfigSpeech.js'
import {IActionUser} from '../Objects/Action.js'
import {ITextTags} from '../Interfaces/iactions.js'
import {EventDefault} from '../Objects/Event/EventDefault.js'

export default class TextHelper {
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
        const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), userId)
        let cleanName = Utils.getFirstValidString(user.name.shortName, userName)
        if(cleanName.length == 0) {
            cleanName = this.cleanName(userName)
            const cleanNameSetting = new SettingUserName()
            cleanNameSetting.shortName = cleanName
            cleanNameSetting.datetime = Utils.getISOTimestamp()
            user.name = cleanNameSetting
            await DataBaseHelper.save(user, userId)
        }
        return cleanName
    }

    static cleanName(name:string): string {
        // Check if the name is a binary string and try to convert it to something reasonable.
        const binaryRegExp = new RegExp(/^[0-1]+$/)
        if(binaryRegExp.test(name)) {
            const hex = Utils.binaryToHexText(name)
            const ascii = Utils.binaryAsciiToText(name)
            const usernameCharsRegExp = new RegExp(/^[a-zA-Z0-9_]+$/)
            if(ascii !== undefined && usernameCharsRegExp.test(ascii)) name = ascii
            else if(hex !== undefined && usernameCharsRegExp.test(hex)) name = hex
        }

        // Split on _ and keep the longest word
        let nameArr = name.toLowerCase().split(/_/g) // Split on _
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
                    let cleanName = await this.loadCleanName(match.substring(1).toLowerCase())
                    text = text.replace(match, cleanName)
                } else {
                    text = text.replace(match, untaggedName)
                }
            }
        }

        if(config?.replaceLinks) {
            // TODO: This misses certain links? Do more testing and adjust.
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

        if(config?.replaceAmpersandWith.length > 0) {
            // Replace &-symbols which otherwise breaks speech generation using certain TTS voices
            text = text.replace(/&/g, config.replaceAmpersandWith)
        }

        return text
            .replace(/(\s+)\1+/g, ' ') // spans of spaces to single space
            .trim()
    }

    static cleanUserName(userName: string) {
        return userName.trim().replace('@', '').toLowerCase()
    }

    static cleanSetting(setting: string) {
        return setting.trim().replace(/[|;]/g, ' ')
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
        const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), userIdStr)
        const subs = user.sub
        const cheers = user.cheer
        const voice = user.voice
        const now = new Date()

        const eventConfig = await DataBaseHelper.loadOrEmpty(new EventDefault(), userData?.eventKey ?? '')
        const eventID = await DataBaseHelper.loadID(EventDefault.ref.build(), userData?.eventKey ?? '')
        const eventLevel = states.multiTierEventCounters.get(eventID.toString())?.count ?? 0
        const eventLevelMax = eventConfig.options.behaviorOptions.multiTierMaxLevel
        const eventCount = (await DataBaseHelper.load(new SettingAccumulatingCounter(), eventID.toString()))?.count ?? 0
        const eventGoal = eventConfig.options.behaviorOptions.accumulationGoal

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
            userSubsTotal: subs?.totalMonths.toString() ?? '0',
            userSubsStreak: subs?.streakMonths.toString() ?? '0',
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
            eventLevelNextProgress: `${eventLevel+1}/${eventLevelMax}`,
            // endregion

            userInputWord1: '',
            userInputWord2: '',
            userInputWord3: '',
            userInputWord4: '',
            userInputWord5: '',
            lastDictionarySubstitute: '',
            lastDictionaryWord: '',
            lastTTSSetNickLogin: '',
            lastTTSSetNickSubstitute: ''

        }
        if(typeof userData?.input === 'string') {
            const inputWordsClone = Utils.clone(userData.inputWords)
            result.userInput = userData.input
            result.userInputHead = inputWordsClone.shift() ?? ''
            result.userInputRest = inputWordsClone.join(' ')
            result.userInputTail = inputWordsClone.pop() ?? ''
            result.userInputNoTags = userData.input.replace(/@\w+/g, '')
            result.userInputNumber = parseFloat(userData.input).toString()
            result.userInputTag = this.getFirstUserTagInText(userData.input) ?? ''
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

    static ensureHeaderSafe(text: string): string {
        return text.replace(/[^a-zA-Z0-9_.,;:#&%!?+=\/\-\s]/g, '')
    }

    /**
     * Highlight tags in text
     * TODO: this is not currently in use but should be used in the editor eventually.
     * @param text
     */
    static highlightTags(text: string): string {
        const re = /(%{.*?[^\\]})|(%\w+)/g
        let parts = text.split(re) ?? []
        let outputArr = []
        for(const part of parts) {
            if(part !== undefined && part.trim().length > 0) {
                if(part.startsWith('%')) {
                    if(part.startsWith('%{')) {
                        if(part.includes('|')) {
                            part.replace('|', `</span><span style="color:orange">|$part`)
                        }
                    }
                    outputArr.push(`<span style="color:purple;">${part}</span>`)
                } else {
                    outputArr.push(part)
                }
            }
        }
        return outputArr.join(' ')
    }
}