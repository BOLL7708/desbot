import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetReward extends BaseDataObject {
    title: string = ''
    cost: number = 1
    prompt: string = ''
    background_color: string = ''
    is_enabled: boolean = true
    is_user_input_required: boolean = false
    is_max_per_stream_enabled: boolean = false
    max_per_stream: number = 0
    is_max_per_user_per_stream_enabled: boolean = false
    max_per_user_per_stream: number = 0
    is_global_cooldown_enabled: boolean = false
    global_cooldown_seconds: number = 0
    is_paused: boolean = false
    should_redemptions_skip_request_queue: boolean = false

    register() {
        DataObjectMap.addRootInstance(
            new PresetReward(),
            'This is the exact payload that will go to Twitch to configure the reward.',
            {
                title: 'The title that will be on the button of the reward.',
                cost: 'The cost in channel points.',
                is_max_per_stream_enabled: 'This needs to be true for the limit to work.',
                max_per_stream: 'Maximum number of redemptions in a single stream.',
                is_max_per_user_per_stream_enabled: 'This needs to be true for the limit to work.',
                max_per_user_per_stream: 'Maximum number of redemptions per user per stream.',
                is_global_cooldown_enabled: 'This needs to be true for the cooldown to be active.',
                global_cooldown_seconds: 'A global cooldown for every user, in seconds.',
                is_paused: 'The reward is visible but not possible to redeem.'
            }
        )
    }
}
