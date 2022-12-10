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
     * The password for OpenVR2WS.
     * Used to change SteamVR settings remotely and receive SteamVR App IDs.
     */
    OpenVR2WSPassword: string

    /**
     * API key for the Google Cloud Platform: Text To Speech API.
     * //TODO: Fill in how to get said API key.
     */
    GoogleTTSApiKey: string

    /**
     * Username for your local Philips Hue hub to control lights and plugs
     * // TODO: Fill in how to get said username.
     */
    PhilipsHueUsername: string

    /**
     * The password set in the config.php file to allow for writing things to disk.
     */
    PHPPassword: string

    /**
     * Webhooks from Discord to which we pipe various things.
     */
    DiscordWebhooks: Partial<Record<TKeys, string>>

    /**
     * API Key for loading Steam user data.
     */
    SteamWebAPIKey: string

    /**
     * The decimal 64bit ID of the Steam user to load data for.
     * You can use one of these website to get this value:
     * - https://steamid.io/
     * - https://www.steamidfinder.com/
     */
    SteamUserID: string

    /**
     * Relay password
     */
    StreamDeckRelayPassword: string
}