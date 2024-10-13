import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class PresetPermissions extends AbstractData {
    streamer: boolean = true
    moderators: boolean = false
    VIPs: boolean = false
    subscribers: boolean = false
    everyone: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPermissions(),
            description: 'Permission regarding who can trigger this command in the chat.',
            documentation: {
                streamer: 'The channel owner/streamer.',
                moderators: 'Moderators for the channel.',
                VIPs: 'People set to VIP in the channel.',
                subscribers: 'People subscribed to the channel.',
                everyone: 'Absolutely anyone at all.'
            }
        })
    }
}