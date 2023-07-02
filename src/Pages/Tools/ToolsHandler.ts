import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import EnlistData from '../../Objects/EnlistData.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'

export default class ToolsHandler {
    constructor() {
        this.init().then()
    }
    async init() {
        EnlistData.run()
        const philipsHueButton = document.querySelector('#philipsHueLights') as HTMLButtonElement
        philipsHueButton.onclick = (e)=>{
            const modules = ModulesSingleton.getInstance()
            setTimeout(()=>{
                PhilipsHueHelper.loadLights().then()
            }, 500)
        }
    }
}