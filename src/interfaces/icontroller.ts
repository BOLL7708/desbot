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
    commandPermissionsOverrides: { [key: string]: ICommandPermissions }
    speechReferences: { [key: string]: string|string[] }
    rewardReferences: { [key: string]: string }
    phpPassword: string
    defaultTwitchGameCategory: string
    resetIncrementingRewards: boolean
}

interface IControllerDefaults {
    pipeAllChat?: boolean
    ttsForAll?: boolean
    pingForChat?: boolean
    logChatToDiscord?: boolean
    useGameSpecificRewards?: boolean
    updateTwitchGameCategory?: boolean
}

interface IScreenshotRequestData {
    userId: number
    userName: string
    userInput: string
}