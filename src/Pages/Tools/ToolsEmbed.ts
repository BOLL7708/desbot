import AuthUtils from '../../Classes/AuthUtils.js'
import ToolsHandler from './ToolsHandler.js'
import PageUtils from '../PageUtils.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new ToolsHandler()
    PageUtils.attach().then()
})().then()
