// Copy and rename this file to secure.base.ts
// Then fill in the things you want to use below.
Secure.OBS = 'Used for remote control of OBS using the WebSockets plugin'
Secure.OpenVR2WS = 'Used to receive app IDs and change SteamVR settings'
Secure.GoogleTTS = 'Used to access the Google Cloud Platform for TTS'
Secure.PhilipsHue = 'Used to control Philips Hue lights locally'
Secure.TwitchClientID = 'Used for Twitch functionality'
Secure.TwitchClientSecret = 'Used for Twitch functionality'
Secure.PHPPassword = 'Used for PHP system tasks, same as in config.php'
Secure.DiscordWebhooks = {
    [KeysTemplate.KEY_DISCORD_SSSVR]: 'The webhook URL you want to use for screenshots',
    [KeysTemplate.KEY_DISCORD_CHAT]: 'The webhook URL you want to use for logging chat',
    [KeysTemplate.COMMAND_SOURCESCREENSHOT]: 'The webhook URL you want to use for OBS screenshots'
}