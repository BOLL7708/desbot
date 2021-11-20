class Run {
    static execute(window: string, command: string) {  
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        const passwordB64 = Utils.encode(Config.controller.phpPassword)
        fetch(`run/run.php?window=${windowb64}&command=${commandb64}`, {headers: {password: passwordB64}})
    }

    static executeCommand(preset: IRunCommand) {
        let index = 0
        const commands: string[] = []
        const commandString = preset.commands.map((cmd)=>{
            const command = Array.isArray(cmd.command) ? Utils.randomFromArray(cmd.command) : cmd.command
            commands[index] = command
            index++
            return cmd.value != undefined ? `${command} ${cmd.value}` : command
        }).join('{ENTER}')
        this.execute(preset.window, commandString)

        if(preset.duration !== undefined) {
            setTimeout(()=>{
                index = 0
                const defaultCommandString = preset.commands.map((cmd)=>{
                    const command = commands[index]
                    index++
                    return cmd.defaultValue != undefined ? `${command} ${cmd.defaultValue}` : command
                }).join('{ENTER}')
                this.execute(preset.window, defaultCommandString)
            }, preset.duration*1000)
        }
    }
}