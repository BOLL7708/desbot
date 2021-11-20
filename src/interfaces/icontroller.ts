// Config
interface IControllerConfig {
    pipeForAllDefault: boolean
    ttsForAllDefault: boolean
    pingForChat: boolean
    logChatToDiscordDefault: boolean
    useGameSpecificRewards: boolean
    websocketsUsed: {
        twitchChat: boolean
        twitchPubsub: boolean
        openvr2ws: boolean
        pipe: boolean
        obs: boolean
        screenshots: boolean
    }
    commandReferences: { [key: string]: string }
    commandPermissionsDefault: ICommandPermissions
    commandPermissionsReferences: { [key: string]: ICommandPermissions }
    speechReferences: { [key: string]: string|string[] }
    rewardReferences: { [key: string]: string }
    phpPassword: string
}

interface IScreenshotRequestData {
    userId: number
    userInput: string
}