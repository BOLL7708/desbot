import DataFileUtils from '../Utils/DataFileUtils.js'

export default class LogWriter {
    // TODO: Extend console with new functions that take color and style as arguments.
    // TODO: Add one console output that does not write to the log file.
    private static _fileName = 'log.txt'

    public static async init() {
        // Clear the log
        await DataFileUtils.writeText(this._fileName, '')
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
        const oldConsole = <{[x:string]:any}> window.console
        const consoleClone = <{[x:string]:any}> Object.assign({}, oldConsole)

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
        window.console = <Console> consoleClone;
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

    private static async write(message: string) {
        await DataFileUtils.appendText(this._fileName, message)
    }
}
