interface ICredentialsConfig {
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
     * The Client ID for your registered application on Twitch.
     */
    TwitchClientID: string

    /**
     * The Client Secret for your registered application on Twitch.
     */
    TwitchClientSecret: string

    /**
     * The refresh token for your channel user. 
     * This is used to retrieve new tokens that is stored in _settings.
     * The channel tokens are used for most reward related things.
     */
    TwitchChannelRefreshToken: string

    /**
     * The refresh token for your chatbot user, if not supplied will use channel token.
     * This is used to retrieve new tokens that is stored in _settings.
     * The chatbot tokens are used for connecting to chat and writing in it.
     */
    TwitchChatbotRefreshToken?: string

    /**
     * The password set in the config.php file to allow for writing things to disk.
     */
    PHPPassword: string

    /**
     * Webhooks from Discord to which we pipe various things.
     */
    DiscordWebhooks: IDiscordWebhookConfig
}