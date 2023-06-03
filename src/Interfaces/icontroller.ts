import {TKeys} from '../_data/!keys.js'
import {ICommandPermissions} from './itwitch.js'
import {ConfigControllerStateDefaults} from '../Objects/Config/Controller.js'

/**
 * These are the settings for `MainController`, the main class that connects all the different modules together.
 */
export interface IControllerConfig {
    /**
     * Overrides settings for the controller functions based on the current game.
     */
    gameDefaults: { [key: string]: IControllerDefaults }

    /**
     * The default permissions for all commands, see overrides below.
     */
    commandPermissionsDefault: ICommandPermissions

    /**
     * These are texts spoken by the TTS for various commands and other events.
     * - The fixed section contains arrays that _needs_ a specific number of items in each.
     * - The dynamic section contains single strings that can be replaced with arrays for random selection or for incrementing rewards.
     * - %[label] is a templated value, those gets replaced by parameters that match their names.
     */
    speechReferences: Partial<Record<TKeys, string | string[]>>

    /**
     * References to texts written in chat by the bot.
     */
    chatReferences: Partial<Record<TKeys, string | string[]>>

    /**
     * Console output will also be written to a file in the _settings folder.
     * It buffers the output and writes it every 10 seconds.
     */
    saveConsoleOutputToSettings: boolean
}

export interface IControllerDefaults {
    pipeAllChat?: boolean
    ttsForAll?: boolean
    pingForChat?: boolean
    logChatToDiscord?: boolean
    useGameSpecificRewards?: boolean
    updateTwitchGameCategory?: boolean
    runRemoteCommands?: boolean
}