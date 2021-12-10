// Config
interface IControllerConfig {
    defaults: IControllerDefaults
    gameDefaults: { [key: string]: IControllerDefaults }
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

interface IControllerDefaults {
    pipeAllChat?: boolean
    ttsForAll?: boolean
    pingForChat?: boolean
    logChatToDiscord?: boolean
    useGameSpecificRewards?: boolean
}

interface IScreenshotRequestData {
    userId: number
    userName: string
    userInput: string
}