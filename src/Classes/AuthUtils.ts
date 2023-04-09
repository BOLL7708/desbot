import Utils from './Utils.js'

export default class AuthUtils {
    static async checkIfAuthed(): Promise<boolean> {
        const response = await fetch('_auth.php', {
            headers: {Authorization: Utils.getAuth()}
        })
        return response.ok
    }
}