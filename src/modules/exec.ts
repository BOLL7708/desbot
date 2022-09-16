import Utils from '../widget/utils.js'
import Config from '../statics/config.js'
import {IPressKeysAction} from '../interfaces/iactions.js'

export default class Exec {
    static runKeyPresses(window: string, command: string, postfixEnterStroke: boolean = true) {  
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        const passwordB64 = Utils.encode(Config.credentials.PHPPassword)
        fetch(`exec/run.php?window=${windowb64}&command=${commandb64}&enter=${postfixEnterStroke ? 1 : 0}`, {headers: {password: passwordB64}})
    }

    static runKeyPressesFromPreset(preset: IPressKeysAction) {
        // Store command strings for possible reset
        const commands: string[] = []
        
        // Build command string
        let index = 0
        const commandString = preset.commands.map((cmd)=>{
            const command = Array.isArray(cmd.command) ? Utils.randomFromArray(cmd.command) : cmd.command
            commands[index] = command // Store command without value for possible reset
            index++
            return cmd.value != undefined ? `${command} ${cmd.value}` : command
        }).join(preset.postfixEnterStroke ? '{ENTER}' : '')

        // Execute command
        this.runKeyPresses(preset.window, commandString, preset.postfixEnterStroke)

        // Reset if we should
        if(preset.duration !== undefined) {
            setTimeout(()=>{               
                // Build command string with reset values
                index = 0
                const defaultCommandString = preset.commands.map((cmd)=>{
                    const command = commands[index]
                    index++
                    return cmd.defaultValue != undefined ? `${command} ${cmd.defaultValue}` : command
                }).join(preset.postfixEnterStroke ? '{ENTER}' : '')
                this.runKeyPresses(preset.window, defaultCommandString, preset.postfixEnterStroke)
            }, preset.duration*1000)
        }
    }

    static loadCustomURI(uri: string) {
        const passwordB64 = Utils.encode(Config.credentials.PHPPassword)
        fetch(`exec/uri.php?uri=${Utils.encode(uri)}`, {headers: {password: passwordB64}})
    }
}