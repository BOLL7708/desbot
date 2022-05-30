/**
 * Combined Reward and Command result object for shared actions.
 */
interface IActionUser {
    id: string
    login: string
    name: string
    input: string
    color: string
    isBroadcaster: boolean
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean
}