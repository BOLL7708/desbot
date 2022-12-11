import Utils from '../Classes/Utils.js'

export default class TopBar {
    static attachSignOutClick() {
        const a = document.querySelector('#topBarSignOutLink') as HTMLLinkElement
        if(a) {
            a.onclick = signOut
            a.ontouchstart = signOut
        }
        function signOut(e: Event) {
            Utils.clearAuth()
        }
    }
}