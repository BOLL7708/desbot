import AuthUtils from '../../Classes/AuthUtils.js'
import EditorHandler from './EditorHandler.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new EditorHandler('Config', true)
})().then()
