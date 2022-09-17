import SectionHandler from './editor/section_handler.js'
import FormHandler from './editor/form_handler.js'

SectionHandler.init()
setTimeout(()=>{
    FormHandler.init().then()
}, 1000) // Artificial loading time...
