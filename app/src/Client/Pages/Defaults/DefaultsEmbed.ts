import EnlistData from '../../../Shared/Objects/EnlistData.js'
import AuthUtils from '../../../Shared/Classes/AuthUtils.js'
import DefaultsHandler from './DefaultsHandler.js'


(async ()=>{
    EnlistData.run()
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = '../../../../../php/index.php'
    const handler = new DefaultsHandler()
})().then()
