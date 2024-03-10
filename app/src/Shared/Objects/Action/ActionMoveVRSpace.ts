import Action, {IActionCallback, IActionUser} from '../Action.js'
import DataMap from '../DataMap.js'
import Utils from '../../Classes/Utils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'

export class ActionMoveVRSpace extends Action {
    x: number = 0
    y: number = 0
    z: number = 0
    moveChaperone: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionMoveVRSpace(),
            tag: '🌐',
            description: 'Used to move the SteamVR play space.',
            documentation: {
                x: 'Sideways position offset',
                y: 'Height position offset',
                z: 'Forwards/backwards position offset',
                moveChaperone: 'Move the Chaperone bounds in the opposite direction to keep them in the right place, defaults to true.',
                duration: 'The amount of time in seconds to wait before moving back, 0 skips this step.'
            }
        })
    }

    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVR2WSMoveSpace action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionMoveVRSpace>(this)
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.moveSpace(clone)
            }
        }
    }
}
