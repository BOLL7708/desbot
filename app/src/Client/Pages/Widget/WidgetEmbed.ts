import AssetsHelper from '../../../Shared/Helpers/AssetsHelper.js'
import MainController from '../../../Shared/Bot/MainController.js'

(async ()=>{
    await AssetsHelper.getAll()
    await MainController.init()
})().then()