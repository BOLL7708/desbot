import DB from '../modules/db.js'
import SectionHandler from './section_handler.js'
import {SettingDictionaryEntry} from '../modules/settings.js'

export default class SettingsHandler {
    private static listDiv: HTMLDivElement|undefined

    public static async init() {
        const settingsClasses = await DB.loadSettingClasses()
        const div = SectionHandler.get('SettingsBrowser')
        SettingsHandler.listDiv = document.createElement('div')
        for(const clazz of settingsClasses) {
            const li = document.createElement('li')
            const a = document.createElement('a')
            a.href = "#"
            a.innerText = clazz
            a.onclick = async () => {
                if(SettingsHandler.listDiv) SettingsHandler.listDiv.innerHTML = `<p>Listing things for ${clazz}</p>`
                const settings = await DB.loadSettingsDictionary<any>(clazz)
                console.log(settings)
                return false
            }
            li.appendChild(a)
            div?.appendChild(li)
        }
        div?.appendChild(SettingsHandler.listDiv)
    }
}