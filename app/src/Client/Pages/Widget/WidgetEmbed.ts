import AssetsHelper from '../../../Shared/Classes/AssetsHelper.js'
import MainController from './MainController.js'


(async ()=>{
    await AssetsHelper.getAll()
    await MainController.init()
})().then()