export default class Data {
    static async writeData(path: string, data: any): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        return response.ok
    }
    static async writeText(path: string, text: string): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'plain/text'
                },
                body: text
            })
        return response.ok
    }
    static async appendText(path: string, text: string): Promise<boolean> {
        const response = await fetch(`data.php?path=${path}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'plain/text'
                },
                body: text
            })
        return response.ok
    }
    static async readData<T>(path: string): Promise<T|string> {
        const response = await fetch(`data.php?path=${path}`)
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.indexOf("application/json") > -1) {
            return await response.json() as T
        } else {
            return await response.text()
        }
    }
}