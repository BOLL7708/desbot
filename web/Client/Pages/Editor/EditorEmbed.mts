import AuthUtils from '../../../Shared/Utils/AuthUtils.mts'
import EditorHandler from './EditorHandler.mts'
import PageUtils from '../PageUtils.mts'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = 'index.php'
    const handler = new EditorHandler()
    PageUtils.attach().then()
})().then()
