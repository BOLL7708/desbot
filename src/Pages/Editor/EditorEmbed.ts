import AuthUtils from '../../Classes/AuthUtils.js'
import EditorHandler from './EditorHandler.js'
import TopBar from '../TopBar.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
    const handler = new EditorHandler()

    TopBar.attachSignOutClick('#topBarSignOutLink')
    TopBar.attachPageModeClick('#topBarPageModeLink')
    TopBar.attachFavorites('#favorites-bar').then()
})().then()
