import AuthUtils from '../../Classes/AuthUtils.js'
import EditorSettingsHandler from './EditorSettingsHandler.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new EditorSettingsHandler()
})().then()
