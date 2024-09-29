import EnlistData from '../../../Shared/Objects/Data/EnlistData.mts'
import AuthUtils from '../../../Shared/Utils/AuthUtils.mts'
import DefaultsHandler from './DefaultsHandler.mts'

(async ()=>{
    EnlistData.run()
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = 'index.php'
    const handler = new DefaultsHandler()
})().then()
