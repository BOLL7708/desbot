import {IActionUser} from '../Interfaces/iactions.js'
import {
    ITwitchAnnouncement,
    ITwitchChatCallback,
    ITwitchChatCheerCallback,
    ITwitchChatMessageCallback,
    ITwitchCommandConfig,
    ITwitchMessageData,
    ITwitchWhisperMessageCallback
} from '../Interfaces/itwitch.js'
import {Actions} from '../Pages/Widget/Actions.js'
import Config from './Config.js'
import {ITwitchMessageCmd} from '../Interfaces/itwitch_chat.js'
import Color from './ColorConstants.js'
import TwitchChat from './TwitchChat.js'
import TwitchFactory from './TwitchFactory.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import Utils from './Utils.js'
import {EEventSource} from '../Pages/Widget/Enums.js'
import DataBaseHelper from './DataBaseHelper.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'
import DiscordUtils from './DiscordUtils.js'
import {SettingTwitchTokens} from '../Objects/Setting/Twitch.js'
import TextHelper from './TextHelper.js'

export default class Twitch{
    // Constants

    /**
     * This [URL]/[Emote ID]/[Resolution], resolution can be 1.0, 2.0 or 3.0.
     */
    static readonly EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1'

    private _twitchChatIn: TwitchChat = new TwitchChat()
    public _twitchChatOut: TwitchChat = new TwitchChat()
    public _twitchChatRemote: TwitchChat = new TwitchChat()
    private LOG_COLOR_COMMAND: string = 'maroon'

    async init(initChat: boolean = true) {
        if(initChat) {
            // In/out for chat in the main channel
            const channelTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
            const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
            this._twitchChatIn.init(channelTokens?.userLogin, channelTokens?.userLogin)
            this._twitchChatOut.init(chatbotTokens?.userLogin, channelTokens?.userLogin, true)

            // Remote command channel
            const remoteChannel = Config.twitch.remoteCommandChannel
            if(remoteChannel.length > 0) this._twitchChatRemote.init(chatbotTokens?.userLogin, Config.twitch.remoteCommandChannel)
        }        
        this._twitchChatIn.registerChatMessageCallback((message) => {
            this.onChatMessage(message)
        })
        this._twitchChatRemote.registerChatMessageCallback((message) => {
            this.onRemoteChatMessage(message)
        })
        this._twitchChatOut.registerWhisperMessageCallback((message) => {
            this.onWhisperMessage(message)
        })
    }

    private _globalCooldowns: Map<string, number> = new Map()
    private _userCooldowns: Map<string, number> = new Map()
    private _commands: ITwitchCommandConfig[] = []
    registerCommand(command: ITwitchCommandConfig) {
		if(command.trigger.length != 0) {
            // Use Default permission if none were provided.
            const originalPermissions = command.permissions ?? {}
            command.permissions = { ...Config.controller.commandPermissionsDefault, ...originalPermissions }
           
            // Store the command
            this._commands.push(command)

            // Log the command
            const who: string[] = []
            if(command.permissions?.everyone) who.push('everyone')
            if(command.permissions?.subscribers) who.push('subs')
            if(command.permissions?.VIPs) who.push('VIPs')
            if(command.permissions?.moderators) who.push('mods')
            if(command.permissions?.streamer) who.push('streamer')
            const message = `Registering command: <${command.trigger}> for ${who.join(' + ')}`
            Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
        } else {
            Utils.logWithBold('Skipped registering a command!', this.LOG_COLOR_COMMAND)
        }
    }

    private _remoteGlobalCooldowns: Map<string, number> = new Map()
    private _remoteUserCooldowns: Map<string, number> = new Map()
    private _remoteCommands: ITwitchCommandConfig[] = []
    registerRemoteCommand(remoteCommand: ITwitchCommandConfig) {
        if(remoteCommand.trigger.length != 0) {
            // Store the command
            this._remoteCommands.push(remoteCommand)

            // Log the command
            const who = remoteCommand.allowedUsers?.join(', ') ?? 'nobody'
            const message = `Registering remote command: <${remoteCommand.trigger}> for ${who}`
            Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
        } else {
            Utils.logWithBold('Skipped registering a command!', this.LOG_COLOR_COMMAND)
        }
    }

    private _announcements: ITwitchAnnouncement[] = []
    registerAnnouncers(twitchAnnouncement: ITwitchAnnouncement) {
        this._announcements.push(twitchAnnouncement)
    }

    private _chatCheerCallback: ITwitchChatCheerCallback = (userName, messageData) => { console.warn('Twitch: Unhandled cheer message') }
    setChatCheerCallback(callback: ITwitchChatCheerCallback) {
        this._chatCheerCallback = callback
    }

    private _chatCallback: ITwitchChatCallback = (userData, messageData) => { console.warn('Twitch: Unhandled chat message') }
    setChatCallback(callback: ITwitchChatCallback) {
        this._chatCallback = callback
    }

    private _allChatCallback: ITwitchChatMessageCallback = () => { console.warn('Twitch: Unhandled chat message (all)') }
    setAllChatCallback(callback: ITwitchChatMessageCallback) {
        this._allChatCallback = callback
    }

    private _whisperCallback: ITwitchWhisperMessageCallback = (messageCmd) => {
        // console.warn('Twitch: Unhandled whisper message')
        // Utils.log(`Got whisper: ${messageCmd.message.text}`, Color.Orange, true, true)
        // console.log(messageCmd)
    }
    setWhisperCallback(callback: ITwitchWhisperMessageCallback) {
        this._whisperCallback = callback
    }

    private async onWhisperMessage(messageCmd: ITwitchMessageCmd) {
        await this.onChatMessage(messageCmd, true)
        this._whisperCallback(messageCmd)
    }

    private async onChatMessage(messageCmd: ITwitchMessageCmd, isWhisper: boolean = false) {
        const msg = messageCmd.message
        if(!msg) return
        let userName: string = msg.username?.toLowerCase() ?? ''
        if(userName.length == 0) return
        let userId: number = parseInt(messageCmd.properties['user-id'] ?? '')
        let text: string = msg.text?.trim() ?? ''
        if(text.length == 0) return
        const isBroadcaster = (messageCmd.properties?.badges ?? <string[]>[]).indexOf('broadcaster/1') > -1
            || userName === (await DataBaseHelper.load(new SettingTwitchTokens(), 'channel'))?.userLogin
        const isModerator = (
            messageCmd.properties?.mod == '1'
            || (await TwitchHelixHelper.isUserModerator(userId)) // Fallback
        ) && !Config.twitch.ignoreModerators.map(name => name.toLowerCase()).includes(userName)
        const isVIP = messageCmd.properties?.badges?.match(/\b(vip\/\d+)\b/) != null
            || (await TwitchHelixHelper.isUserVIP(userId)) // Fallback
        const isSubscriber = messageCmd.properties?.badges?.match(/\b(subscriber\/\d+)\b/) != null

        // Chat proxy
        if(Config.twitch.proxyChatBotName.toLowerCase() == userName) {
            const matches = text.match(Config.twitch.proxyChatFormat)
            if(matches && matches.length == 4) {
                userName = matches[2].toLowerCase()
                text = matches[3]
                Utils.log(`Got proxy message from ${matches[1]}: ${userName} [${text.length}]`, 'purple')
            }
        }

        // User data for most callbacks
        const user: IActionUser = {
            source: EEventSource.TwitchChat,
            eventKey: 'Unknown',
            id: parseInt(messageCmd.properties["user-id"] ?? ''),
            login: userName,
            name: messageCmd.properties?.["display-name"] ?? userName,
            input: '',
            inputWords: [],
            message: await TextHelper.cleanText(messageCmd.message.text, undefined, TwitchFactory.getEmotePositions(messageCmd.properties.emotes ?? [])),
            color: messageCmd.properties?.color ?? '',
            isModerator: isModerator,
            isVIP: isVIP,
            isSubscriber: isSubscriber,
            isBroadcaster: isBroadcaster,
            bits: parseInt(messageCmd?.properties?.bits ?? '0'),
            bitsTotal: 0,
            rewardCost: 0
        }

        // For logging
        if(!isWhisper) this._allChatCallback(messageCmd)

        // Rewards
        if(typeof messageCmd.properties['custom-reward-id'] === 'string') {
            console.log("Twitch Chat: Skipped as it's a reward.")
            return
        }

        // Commands
        if(text && text.indexOf(Config.twitch.commandPrefix) == 0) {
            const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
            if(user.login.toLowerCase() == chatbotTokens?.userLogin) {
                Utils.log(`Twitch Chat: Skipped command as it was from the chat bot account. (${user.login} == ${chatbotTokens?.userLogin})`, this.LOG_COLOR_COMMAND)
                return
            }
            let commandStr = text.split(' ').shift()?.substring(1).toLowerCase()
            let command = this._commands.find(cmd => commandStr == cmd.trigger.toLowerCase())
            let textStr = Utils.splitOnFirst(' ', text).pop()?.trim() ?? ''

            // Word count
            const wordCount = textStr.split(' ').length
            if(command?.requireMinimumWordCount && wordCount < command.requireMinimumWordCount) {
                Utils.log(`Twitch Chat: Skipped command as word count it too low: ${wordCount} < ${command.requireMinimumWordCount}`, this.LOG_COLOR_COMMAND)
                return
            }
            if(command?.requireExactWordCount && wordCount !== command.requireExactWordCount) {
                Utils.log(`Twitch Chat: Skipped command as word count is incorrect: ${wordCount} != ${command.requireMinimumWordCount}`, this.LOG_COLOR_COMMAND)
                return
            }

            // Role check
            const allowedRole = command && (
                (command.permissions?.streamer && isBroadcaster)
                || (command.permissions?.moderators && isModerator) 
                || (command.permissions?.VIPs && isVIP) 
                || (command.permissions?.subscribers && isSubscriber)
                || command.permissions?.everyone
            )

            // Execute command
            if(command && commandStr && allowedRole) {
                user.input = textStr
                user.inputWords = textStr.split(' ')
                user.source = EEventSource.TwitchCommand
                if(!isWhisper || Config.twitch.allowWhisperCommands) {
                    this.handleCommand(command, user, this._globalCooldowns, this._userCooldowns, isBroadcaster)
                }
                if(isWhisper && Config.credentials.DiscordWebhooks['DiscordWhisperCommands']) {
                    const userData = await TwitchHelixHelper.getUserById(user.id)
                    DiscordUtils.enqueueMessage(
                        Config.credentials.DiscordWebhooks['DiscordWhisperCommands'],
                        user.name,
                        userData?.profile_image_url,
                        '**Whisper Command**: '+Utils.escapeForDiscord(user.message)
                    )
                }
                return
            }
        }
        if(isWhisper) return

        const bits = Utils.toInt(messageCmd.properties?.bits, 0)
        const messageData:ITwitchMessageData = {
            text: text,
            bits: bits,
            isAction: msg.isAction,
            emotes: messageCmd.properties?.emotes || []
        }

        const announcement = this._announcements.find(a => a.userNames.includes(userName))
        if(announcement) { // Announcement bots
            const firstWord = text.split(' ')[0]
            if(text.length >= 1 && announcement.triggers.indexOf(firstWord) != -1) return announcement.callback(user, messageData, firstWord)
        } 
        else if(!isNaN(bits) && bits > 0) { // Cheers
            user.source = EEventSource.TwitchCheer
            return this._chatCheerCallback(user, messageData)
        } 
        else { // Normal users
            return this._chatCallback(user, messageData)
        }
    }

    private async onRemoteChatMessage(messageCmd: ITwitchMessageCmd) {
        if(!StatesSingleton.getInstance().runRemoteCommands) return
        const msg = messageCmd.message
        if(!msg) return
        let userName: string = msg.username?.toLowerCase() ?? ''
        if(userName.length == 0) return
        let text: string = msg.text?.trim() ?? ''
        if(text.length == 0) return

        const user = await Actions.buildEmptyUserData(EEventSource.TwitchRemoteCommand, 'Unknown')
        user.login = userName
        user.name = messageCmd.properties?.["display-name"] ?? userName
        user.id = parseInt(messageCmd.properties["user-id"] ?? '')

        // Commands
        if(text && text.indexOf(Config.twitch.remoteCommandPrefix) == 0) {
            let commandStr = text.split(' ').shift()?.substring(1).toLowerCase()
            let command = this._remoteCommands.find(cmd => commandStr == cmd.trigger.toLowerCase())
            let textStr = Utils.splitOnFirst(' ', text).pop()?.trim() ?? ''

            // User check
            const allowedUser = command && (command.allowedUsers ?? []).find((allowedUserName) => allowedUserName.toLowerCase() == userName)

            // Execute command
            if(command && commandStr && allowedUser) {
                user.input = textStr
                user.inputWords = textStr.split(' ')
                user.source = EEventSource.TwitchRemoteCommand
                this.handleCommand(command, user, this._remoteGlobalCooldowns, this._remoteUserCooldowns, false)
                return
            }
        }
    }

    /**
     * Will execute the command handler if it is allowed by the cooldowns.
     * @param command
     * @param user
     * @param pool
     * @param poolUsers
     * @param override
     * @private
     */
    private handleCommand(command: ITwitchCommandConfig, user: IActionUser, pool: Map<string, number>, poolUsers: Map<string, number>, override: boolean) {
        const allowedByGlobalCooldown = command && (
            override
            || command.globalCooldown == undefined
            || new Date().getTime() > (pool.get(command.trigger) ?? 0)
        )
        const cooldownUserKey = `${command.trigger}_${user.login}`
        const allowedByUserCooldown = command && (
            override
            || command.userCooldown == undefined
            || new Date().getTime() > (poolUsers.get(cooldownUserKey) ?? 0)
        )
        user.eventKey = command.handler?.key ?? command.cooldownHandler?.key ?? command.cooldownUserHandler?.key ?? 'Unknown'
        user.commandConfig = command

        // Standard
        if(command.handler) {
            command.handler.call(user).then()
        }

        // Cooldown
        if(
            allowedByGlobalCooldown
            && command.cooldownHandler // If this is set, it means we have no user cooldown.
        ) {
            command.cooldownHandler.call(user).then()
        }
        if(
            !override // Prevent overriding users from activating the cooldown for others.
            && command.globalCooldown !== undefined
            && allowedByGlobalCooldown
            && command.userCooldown === undefined // If we have a user cooldown we set this further down to avoid false positives.
        ) {
            pool.set(command.trigger, new Date().getTime()+(command.globalCooldown*1000))
        }

        // Cooldown User
        if(
            allowedByUserCooldown
            && command.cooldownUserHandler
            && allowedByGlobalCooldown // This will be true if there is no global cooldown, so only affects this if that is also present.
        ) {
            command.cooldownUserHandler.call(user).then()
        }
        if(
            !override // Prevent overriding users from activating the cooldown for others.
            && command.userCooldown !== undefined
            && allowedByUserCooldown
            && allowedByGlobalCooldown // If we were blocked by the global cooldown, we should not set the user cooldown either.
        ) {
            poolUsers.set(cooldownUserKey, new Date().getTime()+(command.userCooldown*1000))
            if(command.globalCooldown !== undefined) {
                // As we call a user cooldown, we set the global cooldown here as well, if we have one.
                pool.set(command.trigger, new Date().getTime()+(command.globalCooldown*1000))
            }
        }

        return
    }

    async runCommand(commandStr: string, userData?: IActionUser) {
        Utils.log(`Run command: ${commandStr}`, Color.Purple)
        let command = this._commands.find(cmd => commandStr.toLowerCase() == cmd.trigger.toLowerCase())
        if(command?.handler) command.handler.call(userData ?? await Actions.buildEmptyUserData(EEventSource.AutoCommand, 'Unknown'))
        else if(command?.cooldownHandler) command?.cooldownHandler.call(userData ?? await Actions.buildEmptyUserData(EEventSource.AutoCommand, 'Unknown'))
    }

    async sendRemoteCommand(commandStr: string) {
        this._twitchChatRemote.sendMessageToChannel(commandStr)
    }
}