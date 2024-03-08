import AuthUtils from '../../Classes/AuthUtils.js'
import DefaultsHandler from './DefaultsHandler.js'
import EnlistData from "../../Objects/EnlistData.js";

(async ()=>{
    EnlistData.run()
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = '../../../../../php/index.php'
    const handler = new DefaultsHandler()
})().then()
