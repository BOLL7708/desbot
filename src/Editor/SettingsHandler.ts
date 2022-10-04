import DB from '../ClassesStatic/DB.js'
import SectionHandler from './SectionHandler.js'
import {SettingDictionaryEntry} from '../Classes/_Settings.js'

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
                // const settings = await DB.loadSettingsDictionary<any>(clazz)
                // console.log(settings)
                return false
            }
            li.appendChild(a)
            div?.appendChild(li)
        }
        div?.appendChild(SettingsHandler.listDiv)
    }
}