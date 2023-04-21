import AuthUtils from '../../Classes/AuthUtils.js'
import DefaultsHandler from './DefaultsHandler.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new DefaultsHandler()
})().then()
