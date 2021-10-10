class Run {
    static execute(window: string, command: string) {  
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        const passwordB64 = Utils.encode(Config.controller.phpPassword)
        fetch(`run/run.php?window=${windowb64}&command=${commandb64}`, {headers: {password: passwordB64}})
    }

    static executeCommand(preset: IRunCommand) {
        const commandString = preset.commands.map((cmd)=>{
            return cmd.value != undefined ? `${cmd.command} ${cmd.value}` : cmd.command
        }).join('{ENTER}')
        this.execute(preset.window, commandString)
        if(preset.duration !== undefined) {
            setTimeout(()=>{
                const defaultCommandString = preset.commands.map((cmd)=>{
                    return cmd.defaultValue != undefined ? `${cmd.command} ${cmd.defaultValue}` : cmd.command
                }).join('{ENTER}')
                this.execute(preset.window, defaultCommandString)
            }, preset.duration*1000)
        }
    }
}