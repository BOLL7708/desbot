import ActionMoveVRSpace from '../../../Shared/Objects/Data/Action/ActionMoveVRSpace.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import AbstractActionRunner from './AbstractActionRunner.js'
import {IOpenVR2WSMoveSpace, IOpenVR2WSMoveSpaceEntry} from '../../../Shared/Classes/OpenVR2WS.js'

export default class ActionMoveVRSpaceRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVR2WSMoveSpace action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionMoveVRSpace)
                const modules = ModulesSingleton.getInstance()

                const entries: IOpenVR2WSMoveSpaceEntry[] = []
                for(const entry of clone.spaceMoveEntries) {
                    entries.push({
                        easeType: entry.easingType,
                        easeMode: entry.easingType_withMode,
                        offsetX: entry.offsetX,
                        offsetY: entry.offsetX_Y,
                        offsetZ: entry.offsetX_Z,
                        rotate: entry.rotate,
                        startOffsetMs: clone.durationMs * entry.startAtPercent,
                        endOffsetMs: clone.durationMs - Math.round((clone.durationMs * entry.startAtPercent_andEndAtPercent)),
                        pingPong: entry.pingPong,
                        repeat: entry.repeat,
                        accumulate: entry.repeat_andAccumulate
                    })
                }
                const data: IOpenVR2WSMoveSpace = {
                    durationMs: clone.durationMs,
                    easeInType: clone.easingInType,
                    easeInMode: clone.easingInType_withMode,
                    easeInMs: clone.durationMs * clone.easingInType_durationPercent,
                    easeOutType: clone.easingOutType,
                    easeOutMode: clone.easingOutType_withMode,
                    easeOutMs: clone.durationMs * clone.easingOutType_durationPercent,
                    resetSpaceBeforeRun: clone.resetSpaceChangesBefore,
                    resetOffsetAfterRun: clone.resetOffsetChangesAfter,
                    correction: clone.correction,
                    entries: entries
                }

                modules.openvr2ws.moveSpace(data)
            }
        }
    }
}