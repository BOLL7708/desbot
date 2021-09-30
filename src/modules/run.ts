class Run {
    static execute(window: string, command: string) {  
        const windowb64 = Utils.encode(window)
        const commandb64 = Utils.encode(command)
        const passwordB64 = Utils.encode(Config.instance.controller.phpPassword)
        fetch(`run/run.php?window=${windowb64}&command=${commandb64}`, {headers: {password: passwordB64}})
    }
}