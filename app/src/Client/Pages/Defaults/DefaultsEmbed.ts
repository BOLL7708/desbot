import EnlistData from '../../../Shared/Objects/Data/EnlistData.js'
import AuthUtils from '../../../Shared/Utils/AuthUtils.js'
import DefaultsHandler from './DefaultsHandler.js'

(async ()=>{
    EnlistData.run()
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = 'index.php'
    const handler = new DefaultsHandler()
})().then()
