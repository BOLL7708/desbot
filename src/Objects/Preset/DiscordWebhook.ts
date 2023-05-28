import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetDiscordWebhook extends BaseDataObject {
    url: string = ''
    isForum: boolean = false
}
DataObjectMap.addRootInstance(
    new PresetDiscordWebhook(),
    'You can get webhooks for any channel in a server your have rights in, this can be used to post various types of content to that channel.',
    {
        url: 'The full webhook URL you get when copying it for a Discord server channel.',
        isForum: 'Check this if you are posting to a forum channel.'
    },
    {
        url: 'string|secret'
    }
)