import SectionHandler from './Editor/SectionHandler.js'
import FormHandler from './Editor/FormHandler.js'

SectionHandler.init()
setTimeout(()=>{
    FormHandler.init().then()
}, 500) // Artificial loading time...
