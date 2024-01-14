import DataMap from '../DataMap.js'
import {IOpenVR2WSRelay} from '../../Interfaces/iopenvr2ws.js'
import TextHelper from '../../Classes/TextHelper.js'
import Callbacks from '../../Pages/Widget/Callbacks.js'
import Utils from '../../Classes/Utils.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'
import Trigger from '../Trigger.js'

export class TriggerRelay extends Trigger {
    key: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerRelay(),
            description: 'A relay message from WSRelay',
            documentation: {
                key: 'Listen to incoming relay messages supplying this key.'
            }
        })
    }

    register(eventKey: string) {
        const relay: IOpenVR2WSRelay = {
            key: TextHelper.replaceTags(this.key, {eventKey: eventKey}),
            handler: new ActionHandler(eventKey)
        }
        if(relay.key.length > 0) {
            Callbacks.registerRelay(relay)
        } else {
            Utils.logWithBold(`Cannot register relay event for: <${eventKey}>.`, 'red')
        }
    }
}