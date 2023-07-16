import {ActionAudio} from '../Action/ActionAudio.js'
import DataMap from '../DataMap.js'
import Data from '../Data.js'
import {SettingUser} from '../Setting/SettingUser.js'
import {SettingSteamGame} from '../Setting/SettingSteam.js'
import {OptionTwitchSubTier} from '../../Options/OptionTwitch.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'

export default class ConfigTwitch extends Data {
    commandPrefix: string = '!'
    defaultCommandPermissions: number|PresetPermissions = 0
    ignoreModerators: number[]|SettingUser[] = []
    allowWhisperCommands: boolean = true
    logWhisperCommandsToDiscord: number|PresetDiscordWebhook = 0
    remoteCommandChannel: number|SettingUser = 0
    remoteCommandPrefix: string = '!'
    remoteCommandAllowedUsers: number[]|SettingUser[] = []
    proxyChatBotUser: number|SettingUser = 0
    proxyChatMessageRegex: string = '/\\[(\\w*):\\s(.+)\\]\\s(.+)/'
    defaultGameCategory: string = 'Games + Demos'
    gameTitleToCategoryOverride: ConfigTwitchCategoryOverride[] = []
    gameCategoryMatchSpeech: string = 'Twitch game updated: %game'
    gameCategoryNoMatchSpeech: string = 'Twitch game not matched: %game'
    announcerUsers: (number|SettingUser)[] = []
    announcerTriggers: ConfigTwitchAnnouncerTriggers[] = []
    announceSubs: ConfigTwitchAnnounceSub[] = [
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Prime, false, false, '%userTag subscribed with Prime! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier1, false, false, '%userTag subscribed with Tier1! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier2, false, false, '%userTag subscribed with Tier2! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier3, false, false, '%userTag subscribed with Tier3! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier1, true, false, '%userTag gifted %targetTag a Tier1 subscription! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier2, true, false, '%userTag gifted %targetTag a Tier2 subscription! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier3, true, false, '%userTag gifted %targetTag a Tier3 subscription! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier1, true, true, '%userTag gifted %giftCount Tier1 subscriptions! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier2, true, true, '%userTag gifted %giftCount Tier2 subscriptions! %userInput'),
        new ConfigTwitchAnnounceSub(OptionTwitchSubTier.Tier3, true, true, '%userTag gifted %giftCount Tier3 subscriptions! %userInput'),
    ]
    announceCheers: ConfigTwitchAnnounceCheer[] = [
        new ConfigTwitchAnnounceCheer(1, '%userTag cheered!'),
        new ConfigTwitchAnnounceCheer(2, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(10, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(50, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(100, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(250, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(500, '%userTag cheered %userBits bits!'),
        new ConfigTwitchAnnounceCheer(1000, '%userTag cheered %userBits bits!')
    ]
    announceRaids: ConfigTwitchAnnounceRaid[] = [ // TODO: WIP, this was never properly implemented so the text tags don't exist yet.
        new ConfigTwitchAnnounceRaid(0, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigTwitchAnnounceRaid(5, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigTwitchAnnounceRaid(10, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigTwitchAnnounceRaid(25, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigTwitchAnnounceRaid(50, '%userTag raided the channel with %viewerCount viewers!')
    ]

    enlist() {
        DataMap.addRootInstance(
            new ConfigTwitch(),
            'Settings for Twitch.',
            {
                commandPrefix: 'Prefix for triggering chat commands.',
                defaultCommandPermissions: 'Default permissions for commands that do not have any set.',
                ignoreModerators: 'List of moderators that should not be able to execute commands, useful for bots.',
                allowWhisperCommands: 'Will allow users with the right permissions to execute commands by whispering the chatbot.',
                logWhisperCommandsToDiscord: 'Will push whisper commands to separate Discord channel for audit purposes.',
                remoteCommandChannel: 'Set this to a Twitch channel name if you want to allow remote commands from a different channel.',
                remoteCommandPrefix: 'Prefix for triggering remote chat commands.',
                remoteCommandAllowedUsers: 'Only allow remote command for these specific users.',
                proxyChatBotUser: 'When using a chat proxy service, like Restream, you can use this to read the messges coming in from that bot as if it were the original user.',
                proxyChatMessageRegex: 'A regular expression to extract the username and message from the proxy chat message.\nThere should be three capture groups, in order: botname, username, message',
                defaultGameCategory: 'The Twitch category that will be used if a game title cannot be automatically matched.',
                gameTitleToCategoryOverride: 'Manual override of game title to Twitch category for when a match is faulty or missing.',
                gameCategoryMatchSpeech: 'Message read out when the Twitch category is set automatically, clear to skip.',
                gameCategoryNoMatchSpeech: 'Message read out when the Twitch category failed to match, clear to skip.',
                announcerUsers: 'Any user that should be treated as an announcer in chat.\n\nThis means most messages are muted from text to speech, unless specified in announcer triggers, and some prefixes can trigger sound effects.',
                announcerTriggers: 'Things triggered by matching the start of an announcements message by any designated announcer.',
                announceSubs: 'Subscription types to announce in chat.',
                announceCheers: 'Cheer levels to announce in chat.',
                announceRaids: 'Raid sizes to announce in chat.'
            },
            {
                defaultCommandPermissions: PresetPermissions.refId(),
                ignoreModerators: SettingUser.refIdLabel(),
                logWhisperCommandsToDiscord: PresetDiscordWebhook.refId(),
                remoteCommandChannel: SettingUser.refIdLabel(),
                remoteCommandAllowedUsers: SettingUser.refIdLabel(),
                proxyChatBotUser: SettingUser.refIdLabel(),
                gameTitleToCategoryOverride: ConfigTwitchCategoryOverride.ref(),
                announcerUsers: SettingUser.refIdLabel(),
                announcerTriggers: ConfigTwitchAnnouncerTriggers.ref(),
                announceSubs: ConfigTwitchAnnounceSub.ref(),
                announceCheers: ConfigTwitchAnnounceCheer.ref(),
                announceRaids: ConfigTwitchAnnounceRaid.ref(),
            }
        )
    }
}

export class ConfigTwitchAnnouncerTriggers extends Data {
    trigger: string = ''
    trigger_audio: number|ActionAudio = 0
    trigger_speech = true

    enlist() {
        DataMap.addSubInstance(
            new ConfigTwitchAnnouncerTriggers(),
            {
                trigger: 'A prefix that triggers a sound effect and optionally speaks the message.'
            },
            {
                trigger_audio: ActionAudio.refId()
            }
        )
    }
}
export class ConfigTwitchAnnounceSub extends Data {
    tier = OptionTwitchSubTier.Prime
    tier_gift: boolean = false
    tier_multi: boolean = false
    message: string = ''
    constructor(tier?: number, gift?: boolean, multi?: boolean, message?: string) {
        super()
        if(tier !== undefined) this.tier = tier
        if(gift !== undefined) this.tier_gift = gift
        if(multi !== undefined) this.tier_multi = multi
        if(message !== undefined) this.message = message
    }

    enlist() {
        DataMap.addSubInstance(
            new ConfigTwitchAnnounceSub(),
            {
                tier: 'The tier of subscription made.',
                message: 'The message to be posted to chat.'
            }, {
                tier: OptionTwitchSubTier.ref()
            }
        )
    }
}
export class ConfigTwitchAnnounceCheer extends Data {
    bits: number = 1
    message: string = ''
    constructor(bits?: number, message?: string) {
        super()
        if(bits !== undefined) this.bits = bits
        if(message !== undefined) this.message = message
    }

    enlist() {
        DataMap.addSubInstance(
            new ConfigTwitchAnnounceCheer(),
            {
                bits: 'Will be used for bit amounts from this value up to the next level.',
                message: 'The message to be posted to chat.'
            }
        )
    }
}
export class ConfigTwitchAnnounceRaid extends Data {
    viewers: number = 0
    message: string = ''
    constructor(viewers?: number, message?: string) {
        super()
        if(viewers !== undefined) this.viewers = viewers
        if(message !== undefined) this.message = message
    }

    enlist() {
        DataMap.addSubInstance(
            new ConfigTwitchAnnounceRaid(),
            {
                viewers: 'Will be used for this amount of viewers up to the next level.',
                message: 'The message to be posted to chat.'
            }
        )
    }
}
export class ConfigTwitchCategoryOverride extends Data {
    game: number | SettingSteamGame = 0
    category: string = ''

    enlist() {
        DataMap.addSubInstance(
            new ConfigTwitchCategoryOverride(),
            {
                game: 'A Steam game where the title does not match the Twitch game category.',
                category: 'The category as seen on Twitch.'
            },
            {
                game: SettingSteamGame.refIdLabel()
            }
        )
    }
}