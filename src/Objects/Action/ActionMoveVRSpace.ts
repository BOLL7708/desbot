import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ActionMoveVRSpace extends BaseDataObject{
    x: number = 0
    y: number = 0
    z: number = 0
    moveChaperone: boolean = true
    duration: number = 0

    register() {
        DataObjectMap.addRootInstance(
            new ActionMoveVRSpace(),
            'Used to move the SteamVR play space.',
            {
                x: 'Sideways position offset',
                y: 'Height position offset',
                z: 'Forwards/backwards position offset',
                moveChaperone: 'Move the Chaperone bounds in the opposite direction to keep them in the right place, defaults to true.',
                duration: 'The amount of time in seconds to wait before moving back, 0 skips this step.'
            }
        )
    }
}
