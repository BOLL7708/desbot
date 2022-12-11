import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import SetupSectionHandler from '../Setup/SetupSectionHandler.js'
import {SettingDictionaryEntry} from '../../Classes/SettingObjects.js'

export default class SettingsHandler {
    private static listDiv: HTMLDivElement|undefined

    public static async init() {
        /*
        const settingsClasses = await DataBaseHelper.loadSettingClasses()
        const div = SetupSectionHandler.get('SettingsBrowser')
        SettingsHandler.listDiv = document.createElement('div')
        for(const clazz of settingsClasses) {
            const li = document.createElement('li')
            const a = document.createElement('a')
            a.href = "#"
            a.innerText = clazz
            a.onclick = async () => {
                if(SettingsHandler.listDiv) SettingsHandler.listDiv.innerHTML = `<p>Listing things for ${clazz}</p>`
                // const settings = await DataBaseHelper.loadSettingsDictionary<any>(clazz)
                // console.log(settings)
                return false
            }
            li.appendChild(a)
            div?.appendChild(li)
        }
        div?.appendChild(SettingsHandler.listDiv)
        */
    }
}