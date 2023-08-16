import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'

export class ConfigController extends Data {
    secretChatSymbols: string[] = ['!', 'ℹ']
    stateDefaults = new ConfigControllerStateDefaults()
    useWebsockets = new ConfigControllerWebsocketsUsed()
    // channelTrophySettings = new ConfigControllerChannelTrophySettings() // TODO

    enlist() {
        DataMap.addRootInstance(
            new ConfigController(),
            'These are the settings for MainController, the main class that connects all the different modules together.',
            {
                secretChatSymbols: 'Messages that start with any of these symbols will not be spoken or piped into VR.',
                stateDefaults: 'Default settings for controller functions and features.',
                useWebsockets: 'Turn WebSockets integration on or off, if you do not use something turning it off will prevent log spam.',
                // channelTrophySettings: 'This is the settings for the Channel Trophy, a reward that a viewer can claim until someone else grabs it.\n\nThe reward will get the name of the previous redeemer, both in the title and in the prompt.'
            },
            {}
        )
    }
}
export class ConfigControllerStateDefaults extends Data {
    pipeAllChat: boolean = true
    ttsForAll: boolean = true
    pingForChat: boolean = true
    logChatToDiscord: boolean = true
    // useGameSpecificRewards: boolean = true // TODO
    updateTwitchGameCategory: boolean = true
    runRemoteCommands: boolean = true

    enlist() {
        DataMap.addSubInstance(
            new ConfigControllerStateDefaults(),
            {
                pipeAllChat: 'Turn this on to get chat messages as notifications in SteamVR.',
                ttsForAll: 'Turn this on to get messages from chat read out loud.',
                pingForChat: 'Turn this on to play an audio notification for chat messages if TTS is also off or the message otherwise silent.',
                logChatToDiscord: 'This pipes chat messages to a Discord webhook for logging purposes.',
                // useGameSpecificRewards: 'Turns on game specific dynamic rewards if they are available, otherwise those will always be disabled.',
                updateTwitchGameCategory: 'This will attempt to match the game title from Steam with one on Twitch and set the Twitch game category on game change.',
                runRemoteCommands: 'This will allow for remote command execution through the remote command channel if provided.'
            }
        )
    }
}
export class ConfigControllerWebsocketsUsed extends Data {
    twitchChat: boolean = true
    twitchEventSub: boolean = true
    obs: boolean = true
    openvr2ws: boolean = true
    pipe: boolean = true
    relay: boolean = true
    sssvr: boolean = true
    // sdrelay: boolean = true // TODO

    enlist() {
        DataMap.addSubInstance(
            new ConfigControllerWebsocketsUsed(),
            {
                twitchChat: 'Twitch Chat connection, for chat messages.',
                twitchEventSub: 'Twitch EventSub connection, for a plethora of channel events.',
                obs: 'OBS Studio connection, to toggle sources and filters.',
                openvr2ws: 'OpenVR2WS connection, to change SteamVR settings and get SteamVR running app ID.',
                pipe: 'OpenVRNotificationPipe connection, to display messages and graphics as SteamVR overlays.',
                relay: 'WSRelay connection, used for remote control.',
                sssvr: 'SuperScreenShotterVR connection, to take and receive SteamVR screenshots.'
                // sdrelay: 'Relay for Stream Deck etc.'
            },
            {}
        )
    }
}
export class ConfigControllerChannelTrophySettings extends Data {
    label: string = '🏆 Channel Trophy #%number\n%userName'
    rewardTitle: string = '🏆 Held by %userName!'
    rewardPrompt: string = 'Currently held by %userName! %prompt Now costs %number points!'
    rewardCooldownMultiplier: number = 30
    ttsOn: boolean = true
    ttsName: string = '@%userName grabbed'
    ttsTrophy: string = 'trophy'
    discordStatistics: number|PresetDiscordWebhook = 0
    uniqueNumbers: { [number: number]: ConfigControllerChannelTrophyNumber } = {}

    enlist() {
        DataMap.addSubInstance(
            new ConfigControllerChannelTrophySettings(),
            {
                label: 'The label that is written to disk.\n\nThe tag %number is the trophy number, and %name is the name of the redeemer.',
                rewardTitle: 'The reward title that is used for the reward after it has been redeemed.\n\nThe tag %name is the name of the redeemer.',
                rewardPrompt: 'The reward prompt that is used for the reward after it has been redeemed.\n\nThe tag %name is the name of the redeemer, %prompt is the existing reward prompt in the reward config, %number is the new reward price.',
                rewardCooldownMultiplier: 'The reward gets a longer cooldown with time, this is a multiplier that can be used to change it.\n\nFormula: [REWARD_COOLDOWN] + Math.round( Math.log( NEW_REWARD_COST ) * [THIS_VALUE] )',
                ttsOn: 'Mention pattern matched rewards when they are redeemed.',
                ttsName: 'This is the name string used when mentioning it using TTS.\n\nThe tag %name is the name of the redeemer, prefix an @ to trigger name replacement.',
                ttsTrophy: 'If your trophy is not really a trophy, give it a name here and that is what will be spoken on special numbers.',
                discordStatistics: 'Post trophy statistics to a specific Discord webhook.',
                uniqueNumbers: 'Channel Trophy numbers that override the pattern matched ones.'
            },
            {
                discordStatistics: PresetDiscordWebhook.refId(),
                uniqueNumbers: ConfigControllerChannelTrophyNumber.ref()
            }
        )
    }
}
export class ConfigControllerChannelTrophyNumber extends Data {
    speech: string = '%start is a good trophy, number %number!'
    label: string = '😀 A Happy Trophy!'

    enlist() {
        DataMap.addSubInstance(
            new ConfigControllerChannelTrophyNumber(),
            {
                speech: 'The tag %start is based on ttsName and %number is the number of the trophy.',
                label: 'The tag %entry is "[name] (number)"'
            }
        )
    }
}