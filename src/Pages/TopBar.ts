import Utils from '../Classes/Utils.js'

export default class TopBar {
    static attachSignOutClick(query: string) {
        const a = document.querySelector(query) as HTMLLinkElement
        if(a) {
            a.onclick = signOut
            a.ontouchstart = signOut
        }
        function signOut(e: Event) {
            Utils.clearAuth()
        }
    }
}