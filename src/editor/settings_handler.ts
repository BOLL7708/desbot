import DB from '../modules/db.js'
import SectionHandler from './section_handler.js'

export default class SettingsHandler {
    public static async init() {
        const settingsClasses = await DB.loadSettingClasses()
        const div = SectionHandler.get('SettingsBrowser')
        if(div) div.insertAdjacentHTML('beforeend', settingsClasses.map((clazz)=>{
            return `<li>${clazz}</li>`
        }).join(''))
    }
}