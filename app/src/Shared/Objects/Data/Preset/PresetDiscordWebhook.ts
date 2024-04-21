import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class PresetDiscordWebhook extends AbstractData {
    url: string = ''
    isForum: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetDiscordWebhook(),
            description: 'You can get webhooks for any channel in a server your have rights in, this can be used to post various types of content to that channel.',
            documentation: {
                url: 'The full webhook URL you get when copying it for a Discord server channel.',
                isForum: 'Check this if you are posting to a forum channel.'
            },
            types: {
                url: 'string|secret'
            }
        })
    }
}