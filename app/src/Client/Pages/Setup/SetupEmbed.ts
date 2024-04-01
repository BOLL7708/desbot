import EnlistData from '../../../Shared/Objects/EnlistData.js'
import SetupFormHandler from './SetupFormHandler.js'


setTimeout(()=>{
    EnlistData.run()
    const handler = new SetupFormHandler()
}, 250) // Artificial loading time...
