import SectionHandler from './Editor/SectionHandler.js'
import FormHandler from './Editor/FormHandler.js'

SectionHandler.init()
setTimeout(()=>{
    FormHandler.init().then()
}, 1000) // Artificial loading time...
