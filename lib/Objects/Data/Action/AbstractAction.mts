import AbstractData from '../AbstractData.mts'
import {EEventSource} from '../../../../bot/Enums.mts'
import {ITwitchCommand} from '../../../../bot/Classes/Twitch.mts'
import {ITwitchEventSubEventRedemption} from '../../../../bot/Classes/TwitchEventSub.mts'

export default abstract class AbstractAction extends AbstractData {
    /**
     * This builds a callback that takes in user data to execute the action.
     * @param key
     */
    async build(key: string): Promise<IActionCallback> {
        console.warn(`Build not implemented for Action: ${key}`)
        return {
            description: 'Abstract action callback',
            call: (user: IActionUser, nonce: string, index?: number) => {
                console.warn('Call not implemented for Action!')
            }
        }
    }
}

/**
 * The callback that will execute this action.
 */
export interface IActionCallback {
    description: string
    awaitCall?: boolean
    call: (user: IActionUser, nonce: string, index?: number) => void // Index is used for entries-fields, provided by handler.
}
export interface IActionsExecutor {
    run: number,
    ms: number,
    nonce: string,
    execute: (user: IActionUser, index?: number) => void
}
export interface IActionsMainCallback {
    (user: IActionUser, index?: number): void
}
export interface IActionsCallbackStack extends Partial<Record<number, IActionCallback|undefined>> {}

/**
 * Combined Reward and Command result object for shared actions.
 *
 * TODO: Replace this with a class later on so we get default values and an easier time initializing it in triggers.
 */
export interface IActionUser {
    source: EEventSource
    eventKey: string
    id: number
    login: string
    name: string
    input: string
    inputWords: string[]
    message: string
    color: string
    isBroadcaster: boolean
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean,
    bits: number,
    bitsTotal: number
    rewardCost: number
    commandConfig?: ITwitchCommand
    rewardMessage?: ITwitchEventSubEventRedemption
}