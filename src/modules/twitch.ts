class Twitch{
    private _twitchTokens: TwitchTokens = new TwitchTokens()
    private _twitchPubsub: TwitchPubsub = new TwitchPubsub()
    private _twitchChat: TwitchChat = new TwitchChat()
    private LOG_COLOR_COMMAND: string = 'maroon'

    constructor() {
        this._twitchTokens.refreshToken().then(token => {
            this._twitchPubsub.init()
            this._twitchChat.init()
        })
    }

    init() {
        this._twitchPubsub.setOnRewardCallback((id, message) => {
            this.onReward(id, message)
            // TODO: This should check if chat is connected and that handle messages that comes with user input
        })
        this._twitchChat.registerChatMessageCallback((message) => {
            this.onChatMessage(message)
        })
    }

    private _rewards: ITwitchReward[] = []
    registerReward(twitchReward: ITwitchReward) {
        this._rewards.push(twitchReward)
    }

    private _commands: ITwitchSlashCommand[] = []
    registerCommand(twitchSlashCommand: ITwitchSlashCommand) {
		if(twitchSlashCommand.trigger.length != 0) {
            this._commands.push(twitchSlashCommand)
            const who = twitchSlashCommand.everyone?'everyone':twitchSlashCommand.mods?'moderators':'the streamer'
            const message = `Registering Slash Command: <${twitchSlashCommand.trigger}> for ${who}`
            Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
        } else {
            Utils.logWithBold('Skipped registering a slash command!', this.LOG_COLOR_COMMAND)
        }
    }

    private _announcements: ITwitchAnnouncement[] = []
    registerAnnouncement(twitchAnnouncement: ITwitchAnnouncement) {
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

    private _allRewardsCallback: ITwitchRewardRedemptionCallback = () => { console.warn('Twitch: Unhandled reward redemption (all)') }
    setAllRewardsCallback(callback: ITwitchRewardRedemptionCallback) {
        this._allRewardsCallback = callback
    }
    
    private onReward(id:string, message:ITwitchRedemptionMessage) {
        this._allRewardsCallback(message)
        let reward = this._rewards.find(reward => id == reward.id)
        if(reward != null) reward.callback(message)
        else console.warn(`Reward not found: ${id}`)
    }
    private onChatMessage(messageCmd: ITwitchMessageCmd) {
        let msg = messageCmd.message
        if(msg == null) return
        let userName:string = msg.username?.toLowerCase()
        if(typeof userName !== 'string' || userName.length == 0) return
        let text:string = msg.text?.trim()
        if(typeof text !== 'string' || text.length == 0) return
        let isBroadcaster = messageCmd.properties?.badges?.indexOf('broadcaster/1') >= 0
        let isMod = messageCmd.properties?.mod == '1'

        // User data for most callbacks
        const userData:ITwitchUserData = {
            userId: messageCmd.properties["user-id"],
            userName: userName,
            displayName: messageCmd.properties?.["display-name"],
            color: messageCmd.properties?.color,
            isMod: isMod,
            isBroadcaster: isBroadcaster
        }

        // For logging
        this._allChatCallback(messageCmd)
        
        // Rewards
        // TODO: For now skip reading rewards, in the future register rewards for both pubsub and chat?
        if(typeof messageCmd.properties['custom-reward-id'] === 'string') {
            console.log("Twitch Chat: Skipped as it's a reward.")
            return
        }

        // Commands
        if(text != null && text.indexOf('!') == 0) {
            let commandStr = text.split(' ').shift().substr(1)
            let command = this._commands.find(cmd => commandStr.toLowerCase() == cmd.trigger.toLowerCase())
            let textStr = Utils.splitOnFirst(' ', text).pop()
            if(command != null && (isBroadcaster || (command.mods && isMod))) return command.callback(userData, textStr)
        }

        const bits = parseInt(messageCmd.properties?.bits)
        const messageData:ITwitchMessageData = {
            text: text,
            bits: bits,
            isAction: msg.isAction,
            emotes: messageCmd.properties?.emotes || []
        }

        const announcement = this._announcements.find(a => a.userName == userName)
        if(announcement) { // Announcement bots
            const firstWord = text.split(' ')[0]
            if(text.length >= 1 && announcement.triggers.indexOf(firstWord) != -1) return announcement.callback(userData, messageData, firstWord)
        } 
        else if(!isNaN(bits) && bits > 0) { // Cheers
            return this._chatCheerCallback(userData, messageData)
        } 
        else { // Normal users
            return this._chatCallback(userData, messageData)
        }
    }
}