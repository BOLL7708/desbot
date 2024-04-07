import Trigger from '../Trigger.js'
import DataMap from '../DataMap.js'
import TextHelper from '../../Classes/TextHelper.js'
import {ActionHandler} from '../../../Client/Pages/Widget/Actions.js'
import Callbacks from '../../../Client/Pages/Widget/Callbacks.js'
import Utils from '../../Classes/Utils.js'
import {IOpenVR2WSRelay} from '../../Classes/OpenVR2WS.js'

export class TriggerRelay extends Trigger {
    key: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerRelay(),
            tag: '📞',
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