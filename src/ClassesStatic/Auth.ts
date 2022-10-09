import Utils from './Utils.js'

export default class Auth {
    static async checkIfAuthed(): Promise<boolean> {
        const response = await fetch('auth.php', {
            headers: {Authorization: Utils.getAuth()}
        })
        return response.ok
    }
}