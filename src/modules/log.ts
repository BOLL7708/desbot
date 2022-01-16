class LogWriter {
    // TODO: Extend console with new functions that take color and style as arguments.
    // TODO: Add one console output that does not write to the log file.
    constructor() {
        // Clear the log
        Settings.pushLabel(Settings.LOG_OUTPUT, '')
        this.override()
    }

    override() {
        const oldConsole = window.console
        const consoleClone = Object.assign({}, oldConsole)

        // Overrides
        consoleClone.log = function(...data:any) {
            LogWriter.buildAndWriteLog('', ...data)
            oldConsole.log(...data)
        }
        consoleClone.info = function(...data:any) {
            LogWriter.buildAndWriteLog('', ...data)
            oldConsole.info(...data)
        }
        consoleClone.warn = function(...data:any) {
            LogWriter.buildAndWriteLog(
                '<span style="color: #5F6368; background-color: #FFFBE5;">&nbsp;WARN&nbsp;</span>: ',
                 ...data
            )
            oldConsole.warn(...data)
        }
        consoleClone.error = function(...data:any) {
            LogWriter.buildAndWriteLog(
                '<span style="color: #FF0000; background-color: #FFF0F0;">&nbsp;ERROR&nbsp;</span>: ',
                ...data
            )
            oldConsole.error(...data)
        }
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
