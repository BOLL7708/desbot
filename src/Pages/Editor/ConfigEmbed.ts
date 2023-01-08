import AuthUtils from '../../Classes/AuthUtils.js'
import EditorHandler from './EditorHandler.js'
import SettingsObjects from '../../Classes/SettingObjects.js'
import ConfigObjects from '../../Classes/ConfigObjects.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new EditorHandler('Config*', new ConfigObjects())
})().then()
