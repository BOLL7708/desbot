import AssetsHelper from '../../../Shared/Helpers/AssetsHelper.mts'
import MainController from '../../../Shared/Bot/MainController.mts'

(async ()=>{
    await AssetsHelper.getAll()
    await MainController.init()
})().then()