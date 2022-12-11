import SetupSectionHandler from './SetupSectionHandler.js'
import SetupFormHandler from './SetupFormHandler.js'

SetupSectionHandler.init()
setTimeout(()=>{
    SetupFormHandler.init().then()
}, 250) // Artificial loading time...
