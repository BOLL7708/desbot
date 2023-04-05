import AuthUtils from '../../Classes/AuthUtils.js'
import SearchHandler from './SearchHandler.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new SearchHandler()
})().then()
