import Data from './Data.js'
import {EEventSource} from '../Pages/Widget/Enums.js'
import {ITwitchEventSubEventRedemption} from '../Interfaces/itwitch_eventsub.js'
import {ITwitchCommand} from '../Classes/Twitch.js'

export default abstract class Action extends Data {
    /**
     * This builds a callback that takes in user data to execute the action.
     * @param key
     */
    abstract build(key: string): IActionCallback
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