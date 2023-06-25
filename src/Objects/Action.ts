import Data from './Data.js'
import {EEventSource} from '../Pages/Widget/Enums.js'
import {ITwitchActionCommandConfig} from '../Interfaces/itwitch.js'
import {ITwitchEventSubEventRedemption} from '../Interfaces/itwitch_eventsub.js'

export default abstract class Action extends Data {
    abstract build<T>(key: string): IActionCallback
}

export interface IActionCallback {
    tag: string
    description: string
    awaitCall?: boolean
    call: (user: IActionUser, index?: number) => void // Index is used for entries-fields, provided by handler.
}
export interface IActionsExecutor {
    timeMs?: number,
    delayMs?: number,
    execute: (user: IActionUser, index?: number) => void
}
export interface IActionsMainCallback {
    (user: IActionUser, index?: number): void
}
export interface IActionsCallbackStack extends Partial<Record<number, IActionCallback|undefined>> {}

/**
 * Combined Reward and Command result object for shared actions.
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
    commandConfig?: ITwitchActionCommandConfig
    rewardMessage?: ITwitchEventSubEventRedemption
}