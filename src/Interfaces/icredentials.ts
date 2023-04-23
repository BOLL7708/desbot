import {TKeys} from '../_data/!keys.js'

/**
 * A separate config for things that are best to keep private.
 *
 * This can with benefit be broken out to a separate file if you want to edit your widget live on stream.
 *
 * See {@link Config} for more info about splitting up the config file.
 */
export interface ICredentialsConfig {
    /**
     * The password for the WebSockets plugin in OBS Studio.
     * Used for remote control of OBS, toggle sources or filters.
     */
    OBSPassword: string

    /**
     * Webhooks from Discord to which we pipe various things.
     */
    DiscordWebhooks: Partial<Record<TKeys, string>>
}