import AbstractTrigger from './AbstractTrigger.js'
import DataMap from '../DataMap.js'
import ModulesSingleton from '../../../Singletons/ModulesSingleton.js'
import {ActionHandler} from '../../../Bot/Actions.js'
import {ITwitchCheer} from '../../../Classes/TwitchEventSub.js'
import Utils from '../../../Utils/Utils.js'

export class TriggerCheer extends AbstractTrigger {
    amount: number = 1

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerCheer(),
            tag: '💰',
            description: 'A channel cheer',
            documentation: {
                amount: 'If a viewer cheers this specific bit amount it will trigger this event.'
            }
        })
    }

    register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(eventKey)
        const cheer: ITwitchCheer = {
            bits: this.amount,
            handler: actionHandler
        }
        if(cheer.bits > 0) {
            modules.twitchEventSub.registerCheer(cheer)
        } else {
            Utils.logWithBold(`Cannot register cheer event for: <${eventKey}>.`, 'red')
        }
    }
}