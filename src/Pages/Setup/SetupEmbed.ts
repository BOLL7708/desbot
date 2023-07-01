import SetupFormHandler from './SetupFormHandler.js'
import EnlistData from '../../Objects/EnlistData.js'

setTimeout(()=>{
    EnlistData.run()
    const handler = new SetupFormHandler()
}, 250) // Artificial loading time...
