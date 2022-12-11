import AuthUtils from '../../Classes/AuthUtils.js'

(async ()=>{
    const authed = await AuthUtils.checkIfAuthed()
    if(!authed) window.location.href = './index.php'
})().then()
