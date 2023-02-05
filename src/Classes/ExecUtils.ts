import Utils from './Utils.js'
import {IInputAction, TRunType} from '../Interfaces/iactions.js'

export default class ExecUtils {
    static runKeyPresses(window: string, type: TRunType, command: string, postfixEnterStroke: boolean = true) {
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        Utils.getAuth()
        fetch(
            `_run.php?window=${windowb64}&type=${type}&command=${commandb64}&enter=${postfixEnterStroke ? 1 : 0}`,
            Utils.getAuthInit()
        ).then()
    }

    static runKeyPressesFromPreset(preset: IInputAction) {
        // Store command strings for possible reset
        const commands: string[] = []
        
        // Build command string
        let index = 0
        const commandString = preset.commands.map((cmd)=>{
            const command = Array.isArray(cmd.command) ? Utils.randomFromArray(cmd.command) : cmd.command
            commands[index] = command // Store command without value for possible reset
            index++
            return cmd.value != undefined ? `${command} ${cmd.value}` : command
        }).join(preset.type == 'keys' && preset.postfixEnterStroke ? '{ENTER}' : '')

        // Execute command
        this.runKeyPresses(preset.window, preset.type, commandString, preset.postfixEnterStroke)

        // Reset if we should
        if(preset.duration !== undefined) {
            setTimeout(()=>{               
                // Build command string with reset values
                index = 0
                const defaultCommandString = preset.commands.map((cmd)=>{
                    const command = commands[index]
                    index++
                    return cmd.defaultValue != undefined ? `${command} ${cmd.defaultValue}` : command
                }).join(preset.type == 'keys' && preset.postfixEnterStroke ? '{ENTER}' : '')
                this.runKeyPresses(preset.window, preset.type, defaultCommandString, preset.postfixEnterStroke)
            }, preset.duration*1000)
        }
    }

    static loadCustomURI(uri: string) {
        fetch(
            `_uri.php?uri=${Utils.encode(uri)}`,
            Utils.getAuthInit()
        ).then()
    }
}