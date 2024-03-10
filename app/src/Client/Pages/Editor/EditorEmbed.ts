import AuthUtils from '../../../Shared/Classes/AuthUtils.js'
import EditorHandler from './EditorHandler.js'
import PageUtils from '../PageUtils.js'


(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = '../../../../../php/index.php'
    const handler = new EditorHandler()
    PageUtils.attach().then()
})().then()
