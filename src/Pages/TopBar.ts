import Utils from '../Classes/Utils.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'

export default class TopBar {
    static attachSignOutClick(elementId: string) {
        const a = document.querySelector(elementId) as HTMLLinkElement
        if(a) {
            a.onclick = signOut
            a.ontouchstart = signOut
        }
        function signOut(e: Event) {
            Utils.clearAuth()
        }
    }
}