import AuthUtils from '../../Classes/AuthUtils.js'
import SearchHandler from './SearchHandler.js'
import PageUtils from '../PageUtils.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = '../../../../../php/index.php'
    const handler = new SearchHandler()
    PageUtils.attach().then()
})().then()
