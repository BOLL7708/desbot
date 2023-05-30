import {ActionAudio} from '../Action/ActionAudio.js'
import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'
import {SettingUser, SettingUserName} from '../Setting/User.js'

export default class ConfigTwitch extends BaseDataObject {
    announcerUsers: (number|SettingUser)[] = []
    announcerTriggers: { [pattern: string]: ConfigTwitchAnnouncerTriggers } = {}
}

export class ConfigTwitchAnnouncerTriggers extends BaseDataObject {
    audio: number|ActionAudio = 0
    speech = true
}

DataObjectMap.addRootInstance(
    new ConfigTwitch(),
    'Settings for Twitch.',
    {
        announcerUsers: 'Any user that should be treated as an announcer in chat.\n\nThis means most messages are muted from text to speech, unless specified in announcer triggers, and some prefixes can trigger sound effects.',
        announcerTriggers: 'Things triggered by matching the start of an announcements message by any designated announcer.'
    },
    {
        announcerUsers: SettingUser.refIdLabel(),
        announcerTriggers: ConfigTwitchAnnouncerTriggers.ref(),
    }
)

DataObjectMap.addSubInstance(
    new ConfigTwitchAnnouncerTriggers(),
    {
        audio: 'Audio that will be played back before any other effect is triggered.',
        speech: 'If the announcement should be spoken aloud using text to speech.'
    },
    {
        audio: ActionAudio.refId()
    }
)