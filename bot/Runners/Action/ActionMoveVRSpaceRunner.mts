import {ActionMoveVRSpace, IActionCallback, IActionUser} from '../../../lib/index.mts'
import {IOpenVR2WSMoveSpace, IOpenVR2WSMoveSpaceEntry} from '../../Classes/Api/OpenVR2WS.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import Utils from '../../Utils/Utils.mts'

ActionMoveVRSpace.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an OpenVR2WSMoveSpace action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionMoveVRSpace)
         const modules = ModulesSingleton.getInstance()

         const entries: IOpenVR2WSMoveSpaceEntry[] = []
         for (const entry of clone.spaceMoveEntries) {
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