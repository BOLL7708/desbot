import Utils from './Utils.js'

export default class Data {
    static async writeData(path: string, data: any): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'POST',
                headers: {
                    Authorization: Utils.getAuth(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        if(!response.ok) console.warn(`Could not write data: ${path}`)
        return response.ok
    }
    static async writeText(path: string, text: string): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'POST',
                headers: {
                    Authorization: Utils.getAuth(),
                    'Content-Type': 'plain/text'
                },
                body: text
            })
        if(!response.ok) console.warn(`Could not write text: ${path}`)
        return response.ok
    }
    static async appendText(path: string, text: string): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: Utils.getAuth(),
                    'Content-Type': 'plain/text'
                },
                body: text
            })
        if(!response.ok) console.warn(`Could not append text: ${path}`)
        return response.ok
    }
    static async readData<T>(path: string): Promise<T|string|undefined> {
        const response = await fetch(`data.php?path=${path}`, {
            headers: {Authorization: Utils.getAuth()}
        })
        if(!response.ok) {
            console.warn(`Could not read: ${path}`)
            return undefined
        }
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.indexOf("application/json") > -1) {
            return await response.json() as T
        } else {
            return await response.text()
        }
    }
}


// region Data Constants & Classes
export const LOCAL_STORAGE_AUTH_KEY = 'BOLL7708_streaming_widget_auth'
export class AuthData {
    hash: string = ''
}
export class DBData {
    host: string = ''
    port: number = 0
    username: string = ''
    password: string = ''
    database: string = ''
}
export class GitVersion {
    count: number = 0
}
export class MigrationData {
    ok: boolean = false
    count: number = 0
    id: number = 0
}
// endregion