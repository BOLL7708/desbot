class LogWriter {
    // TODO: Extend console with new functions that take color and style as arguments.
    // TODO: Add one console output that does not write to the log file.
    public static init() {
        // Clear the log
        Settings.pushLabel(Settings.LOG_OUTPUT, '')
        this.override()
    }

    private static override() {
        const types = [
            'assert',
            'debug',
            'dir',
            'error',
            'info',
            'log',
            'trace',
            'warn'
        ]
        const oldConsole = window.console
        const consoleClone = Object.assign({}, oldConsole)

        // Override standard calls
        for(const key of types) {
            consoleClone[key] = function(...data:any) {
                LogWriter.buildAndWriteLog(`<span>key</span>: `, ...data)
                oldConsole[key](...data)
            }
        }

        /*
		TODO: Special handling:
			dir
			group
			groupCollapsed
			groupEnd
			table?
			
		*/
        window.console = consoleClone;
    }

    private static buildAndWriteLog(type: string, ...data:any) {
        const message = Array.isArray(data) && data.length > 0 ? data.shift() : 'EMPTY'
        const style = Array.isArray(data) && data.length > 0 ? data.shift() : null
        const html = this.build(type, message, style, ...data)
        this.write(html)
    }

    private static build(type: string, message: string, style: string, ...data:any): string {
        const date = `<span>${new Date().toLocaleString("SV")}&nbsp;</span>`
        if(typeof message == 'string' && message.match(/%c/) != null) {
            message = message.replace(/%c/, '')
        }
        if(typeof message != 'string') {
            message = '<pre>'+JSON.stringify(message, null, '  ')+'</pre>'
        } else {
            message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            if(typeof style == 'string') {
                message = `<p>${date}<span style="${style}">${type}${message}</span></p>`
            } else {
                message = `<p>${date}${type}${message}</p>`
            }
        }
        return message
    }

    private static write(message: string) {
        Settings.appendSettingAtInterval(Settings.LOG_OUTPUT, message)
    }
}
