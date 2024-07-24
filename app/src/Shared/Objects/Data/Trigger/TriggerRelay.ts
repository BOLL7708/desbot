import AbstractTrigger from './AbstractTrigger.js'
import DataMap from '../DataMap.js'
import TextHelper from '../../../Helpers/TextHelper.js'
import {ActionHandler} from '../../../Bot/Actions.js'
import Callbacks from '../../../Bot/Callbacks.js'
import Utils from '../../../Utils/Utils.js'
import {IRelay} from '../../../Classes/Relay.js'

export default class TriggerRelay extends AbstractTrigger {
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
        const relay: IRelay = {
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