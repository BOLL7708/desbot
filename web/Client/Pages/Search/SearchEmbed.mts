import AuthUtils from '../../../Shared/Utils/AuthUtils.mts'
import SearchHandler from './SearchHandler.mts'
import PageUtils from '../PageUtils.mts'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = 'index.php'
    const handler = new SearchHandler()
    PageUtils.attach().then()
})().then()
