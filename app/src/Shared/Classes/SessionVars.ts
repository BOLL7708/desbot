/**
 * Static store of values that are not persisted between sessions.
 */
export default class SessionVars {
    public static lastTwitchChatterUserId: string|undefined
    public static lastTwitchChatMessage: string|undefined
}