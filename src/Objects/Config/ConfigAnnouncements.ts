import {ActionAudio} from '../Action/ActionAudio.js'
import DataMap from '../DataMap.js'
import Data, {DataEntries} from '../Data.js'
import {SettingUser} from '../Setting/SettingUser.js'
import {OptionTwitchSubTier} from '../../Options/OptionTwitch.js'

export default class ConfigAnnouncements extends Data {
    announcerUsers: number[]|DataEntries<SettingUser> = []
    announcerTriggers: ConfigAnnouncerTriggers[] = []
    announceSubs: ConfigAnnounceSub[] = [
        new ConfigAnnounceSub(OptionTwitchSubTier.Prime, false, false, '%userTag subscribed with Prime! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier1, false, false, '%userTag subscribed with Tier1! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier2, false, false, '%userTag subscribed with Tier2! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier3, false, false, '%userTag subscribed with Tier3! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier1, true, false, '%userTag gifted %targetTag a Tier1 subscription! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier2, true, false, '%userTag gifted %targetTag a Tier2 subscription! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier3, true, false, '%userTag gifted %targetTag a Tier3 subscription! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier1, true, true, '%userTag gifted %giftCount Tier1 subscriptions! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier2, true, true, '%userTag gifted %giftCount Tier2 subscriptions! %userInput'),
        new ConfigAnnounceSub(OptionTwitchSubTier.Tier3, true, true, '%userTag gifted %giftCount Tier3 subscriptions! %userInput'),
    ]
    announceCheers: ConfigAnnounceCheer[] = [
        new ConfigAnnounceCheer(1, '%userTag cheered!'),
        new ConfigAnnounceCheer(2, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(10, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(50, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(100, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(250, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(500, '%userTag cheered %userBits bits!'),
        new ConfigAnnounceCheer(1000, '%userTag cheered %userBits bits!')
    ]
    announceRaids: ConfigAnnounceRaid[] = [ // TODO: WIP, this was never properly implemented so the text tags don't exist yet.
        new ConfigAnnounceRaid(0, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigAnnounceRaid(5, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigAnnounceRaid(10, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigAnnounceRaid(25, '%userTag raided the channel with %viewerCount viewers!'),
        new ConfigAnnounceRaid(50, '%userTag raided the channel with %viewerCount viewers!')
    ]

    enlist() {
        DataMap.addRootInstance(
            new ConfigAnnouncements(),
            'Settings for possible announcements.',
            {
                announcerUsers: 'Any user that should be treated as an announcer in chat.\n\nThis means most messages are muted from text to speech, unless specified in announcer triggers, and some prefixes can trigger sound effects.',
                announcerTriggers: 'Things triggered by matching the start of an announcements message by any designated announcer.',
                announceSubs: 'Subscription types to announce in chat.',
                announceCheers: 'Cheer levels to announce in chat.',
                announceRaids: 'Raid sizes to announce in chat.'
            },
            {
                announcerUsers: SettingUser.ref.id.label.build(),
                announcerTriggers: ConfigAnnouncerTriggers.ref.build(),
                announceSubs: ConfigAnnounceSub.ref.build(),
                announceCheers: ConfigAnnounceCheer.ref.build(),
                announceRaids: ConfigAnnounceRaid.ref.build(),
            }
        )
    }
}

export class ConfigAnnouncerTriggers extends Data {
    trigger: string = ''
    trigger_audio: number|DataEntries<ActionAudio> = 0
    trigger_speech = true

    enlist() {
        DataMap.addSubInstance(
            new ConfigAnnouncerTriggers(),
            {
                trigger: 'A prefix that triggers a sound effect and optionally speaks the message.'
            },
            {
                trigger_audio: ActionAudio.ref.id.build()
            }
        )
    }
}
export class ConfigAnnounceSub extends Data {
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
            new ConfigAnnounceSub(),
            {
                tier: 'The tier of subscription made.',
                message: 'The message to be posted to chat.'
            }, {
                tier: OptionTwitchSubTier.ref
            }
        )
    }
}
export class ConfigAnnounceCheer extends Data {
    bits: number = 1
    message: string = ''
    constructor(bits?: number, message?: string) {
        super()
        if(bits !== undefined) this.bits = bits
        if(message !== undefined) this.message = message
    }

    enlist() {
        DataMap.addSubInstance(
            new ConfigAnnounceCheer(),
            {
                bits: 'Will be used for bit amounts from this value up to the next level.',
                message: 'The message to be posted to chat.'
            }
        )
    }
}
export class ConfigAnnounceRaid extends Data {
    viewers: number = 0
    message: string = ''
    constructor(viewers?: number, message?: string) {
        super()
        if(viewers !== undefined) this.viewers = viewers
        if(message !== undefined) this.message = message
    }

    enlist() {
        DataMap.addSubInstance(
            new ConfigAnnounceRaid(),
            {
                viewers: 'Will be used for this amount of viewers up to the next level.',
                message: 'The message to be posted to chat.'
            }
        )
    }
}