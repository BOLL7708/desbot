import AuthUtils from '../../Classes/AuthUtils.js'
import ToolsHandler from './ToolsHandler.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new ToolsHandler()
})().then()
