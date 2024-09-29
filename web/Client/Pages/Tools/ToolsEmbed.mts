import AuthUtils from '../../../Shared/Utils/AuthUtils.mts'
import ToolsHandler from './ToolsHandler.mts'
import PageUtils from '../PageUtils.mts'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = 'index.php'
    const handler = new ToolsHandler()
    PageUtils.attach().then()
})().then()
