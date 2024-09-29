import EnlistData from '../../../Shared/Objects/Data/EnlistData.mts'
import SetupFormHandler from './SetupFormHandler.mts'

setTimeout(()=>{
    EnlistData.run()
    const handler = new SetupFormHandler()
}, 250) // Artificial loading time...
