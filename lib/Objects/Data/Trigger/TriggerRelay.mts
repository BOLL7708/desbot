import {AbstractTrigger} from './AbstractTrigger.mts'
import {DataMap} from '../DataMap.mts'
import TextHelper from '../../../../bot/Helpers/TextHelper.mts'
import {ActionHandler} from '../../../../bot/Classes/Actions.mts'
import Callbacks from '../../../../bot/Classes/Callbacks.mts'
import Utils from '../../../../bot/Utils/Utils.mts'
import {IRelay} from '../../../../bot/Classes/Api/Relay.mts'

export class TriggerRelay extends AbstractTrigger {
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