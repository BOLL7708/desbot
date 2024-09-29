import AbstractTrigger from './AbstractTrigger.mts'
import DataMap from '../DataMap.mts'
import TextHelper from '../../../Helpers/TextHelper.mts'
import {ActionHandler} from '../../../Actions.mts'
import Callbacks from '../../../Callbacks.mts'
import Utils from '../../../Utils/Utils.mts'
import {IRelay} from '../../../Classes/Relay.mts'

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