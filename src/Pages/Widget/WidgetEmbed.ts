import MainController from './MainController.js'
import AssetsHelper from '../../Classes/AssetsHelper.js'

(async ()=>{
    await AssetsHelper.getAll()
    await MainController.init()
})().then()