import AbstractTrigger from './AbstractTrigger.mts'
import DataMap from '../DataMap.mts'
import ModulesSingleton from '../../../Singletons/ModulesSingleton.mts'
import {ActionHandler} from '../../../Actions.mts'
import {ITwitchCheer} from '../../../Classes/TwitchEventSub.mts'
import Utils from '../../../Utils/Utils.mts'

export default class TriggerCheer extends AbstractTrigger {
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