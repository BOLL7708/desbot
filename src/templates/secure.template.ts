// Copy and rename this file to secure.base.ts
// Then fill in the passwords and webhooks for the things you want to use below.
Secure.OBS = 'Used for remote control of OBS using the WebSockets plugin'
Secure.OpenVR2WS = 'Used to receive app IDs and change SteamVR settings'
Secure.GoogleTTS = 'Used to access the Google Cloud Platform for TTS'
Secure.PhilipsHue = 'Used to control Philips Hue lights locally'
Secure.TwitchClientID = 'Used for Twitch functionality'
Secure.TwitchClientSecret = 'Used for Twitch functionality'
Secure.TwitchChannelAccessToken = 'Used for Twitch functionality'
Secure.TwitchChannelRefreshToken = 'Used for Twitch functionality'
Secure.TwitchChatbotAccessToken = 'Used for Twitch functionality, only if you have a separate chatbot user'
Secure.TwitchChatbotRefreshToken = 'Used for Twitch functionality, only if you have a separate chatbot user'
Secure.PHPPassword = 'Used for PHP system tasks, same as in config.php'
Secure.DiscordWebhooks = {
    [KeysTemplate.KEY_DISCORD_SSSVR]: 'The webhook URL you want to use for VR screenshots',
    [KeysTemplate.KEY_DISCORD_CHAT]: 'The webhook URL you want to use for logging Twitch chat',
    [KeysTemplate.KEY_CHANNELTROPHY]: 'The webhook URL you want to use for the channel trophy',
    [KeysTemplate.COMMAND_SOURCESCREENSHOT]: 'The webhook URL you want to use for OBS screenshots',
    [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: 'The webhook URL you want to use for channel trophy statistics',
    [KeysTemplate.COMMAND_CLIPS]: 'The webhook URL you want to use for Twitch clips'
}