import {ActionHandler} from '../../../../bot/Classes/Actions.mts'
import {ITwitchCheer} from '../../../../bot/Classes/Api/TwitchEventSub.mts'
import ModulesSingleton from '../../../../bot/Singletons/ModulesSingleton.mts'
import Utils from '../../../../bot/Utils/Utils.mts'
import {DataMap} from '../DataMap.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

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