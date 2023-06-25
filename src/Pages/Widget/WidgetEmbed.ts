import MainController from './MainController.js'
import AssetsHelper from '../../Classes/AssetsHelper.js'
import '../../Includes/Extensions.js'
import '../../_configs/config+custom.js'
import '../../_configs/config+games.js'
import '../../_configs/config+links.js'
import '../../_configs/config+rewards.js'
import '../../_configs/config+system.js'
import '../../_configs/config+tts.js'
import '../../_configs/config.js'
import '../../_configs/config=test.js'
import '../../_configs/config-credentials.js'

(async ()=>{
    await AssetsHelper.getAll()
    await MainController.init()
})().then()