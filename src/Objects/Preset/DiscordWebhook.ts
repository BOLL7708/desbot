import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetDiscordWebhook extends BaseDataObject {
    label: string = ''
    url: string = ''
}
DataObjectMap.addRootInstance(
    new PresetDiscordWebhook(),
    'You can get webhooks for any channel in a server your have rights in, this can be used to post various types of content to that channel.',
    {
        label: 'The label seen when picking this from some lists.',
        url: 'The full webhook URL you get when copying it for a Discord server channel.'
    },
    {
        url: 'string|secret'
    }
)