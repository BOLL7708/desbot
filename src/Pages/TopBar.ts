import Utils from '../Classes/Utils.js'

export default class TopBar {
    static attachSignOutClick() {
        const a = document.querySelector('#topBarSignOutLink') as HTMLLinkElement
        a.onclick = (e) => {
            signOut()
        }
        a.ontouchstart = (e) => {
            signOut()
        }
        function signOut() {
            Utils.clearAuth()
        }
    }
}