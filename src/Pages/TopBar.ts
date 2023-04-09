import Utils from '../Classes/Utils.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'
import DataUtils from '../Classes/DataUtils.js'

export default class TopBar {
    static attachSignOutClick(elementId: string) {
        const a = document.querySelector(elementId) as HTMLLinkElement
        if(a) {
            function signOut(e: Event) {
                Utils.clearAuth()
            }
            a.onclick = signOut
            a.ontouchstart = signOut
        }
    }
    static attachPageModeClick(elementId: string) {
        const a = document.querySelector(elementId) as HTMLLinkElement
        if(a) {
            const dataFile = 'page_mode.json'
            const styleTag = document.querySelector('#link-page-mode-stylesheet') as HTMLLinkElement
            async function togglePageMode() {
                if(styleTag) {
                    const currentMode = Utils.toBool(await DataUtils.readData(dataFile))
                    await DataUtils.writeData(dataFile, currentMode ? 0 : 1)
                    styleTag.href = `./styles/_${currentMode ? 'bright' : 'dark'}.css`
                }
            }
            a.onclick = togglePageMode
            a.ontouchstart = togglePageMode
        }
    }
}