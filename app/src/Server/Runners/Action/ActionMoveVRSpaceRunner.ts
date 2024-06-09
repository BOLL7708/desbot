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
                        EaseType: entry.easingType,
                        EaseMode: entry.easingType_withMode,
                        OffsetX: entry.offsetX,
                        OffsetY: entry.offsetX_Y,
                        OffsetZ: entry.offsetX_Z,
                        Rotate: entry.rotate,
                        StartOffsetMs: clone.durationMs * entry.startAtPercent,
                        EndOffsetMs: clone.durationMs - Math.round((clone.durationMs * entry.startAtPercent_andEndAtPercent)),
                        PingPong: entry.pingPong,
                        Repeat: entry.repeat,
                        Accumulate: entry.repeat_andAccumulate
                    })
                }
                const data: IOpenVR2WSMoveSpace = {
                    DurationMs: clone.durationMs,
                    EaseInType: clone.easingInType,
                    EaseInMode: clone.easingInType_withMode,
                    EaseInMs: clone.durationMs * clone.easingInType_durationPercent,
                    EaseOutType: clone.easingOutType,
                    EaseOutMode: clone.easingOutType_withMode,
                    EaseOutMs: clone.durationMs * clone.easingOutType_durationPercent,
                    ResetSpaceBeforeRun: clone.resetSpaceChangesBefore,
                    ResetOffsetAfterRun: clone.resetOffsetChangesAfter,
                    Correction: clone.correction,
                    Entries: entries
                }

                modules.openvr2ws.moveSpace(data)
            }
        }
    }
}