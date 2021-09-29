class Run {
    static execute(window: string, command: string) {  
        const windowb64 = btoa(window)
        const commandb64 = btoa(command)
        fetch(`run/run.php?window=${windowb64}&command=${commandb64}`)
    }
}