// Rename this file to Secure.ts and refactor this class to Secure.
// Then fill in the things you want to use below.
class SecureTemplate {
    static OBS: string = 'Used for remote control of OBS using the WebSockets plugin'
    static OpenVR2WS: string = 'Used to receive app IDs and change SteamVR settings'
    static GoogleTTS: string = 'Used to access the Google Cloud Platform for TTS'
    static PhilipsHue: string = 'Used to control Philips Hue lights locally'
    static TwitchClientID: string = 'Used for Twitch functionality'
    static TwitchClientSecret: string = 'Used for Twitch functionality'
    static DiscordWebhooks: IDiscordWebhookConfig = {
        [KeysTemplate.KEY_DISCORD_SSSVR]: 'The webhook URL you want to use for screenshots',
        [KeysTemplate.KEY_DISCORD_CHAT]: 'The webhook URL you want to use for logging chat',
        [KeysTemplate.COMMAND_SOURCESCREENSHOT]: 'The webhook URL you want to use for OBS screenshots'
    }
}