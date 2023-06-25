import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class PresetPermissions extends Data {
    streamer: boolean = true
    moderators: boolean = false
    VIPs: boolean = false
    subscribers: boolean = false
    everyone: boolean = false

    enlist() {
        DataMap.addRootInstance(new PresetPermissions(),
            'Permission regarding who can trigger this command in the chat.',
            {
                streamer: 'The channel owner/streamer.',
                moderators: 'Moderators for the channel.',
                VIPs: 'People set to VIP in the channel.',
                subscribers: 'People subscribed to the channel.',
                everyone: 'Absolutely anyone at all.'
            }
        )
    }
}