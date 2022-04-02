/**
 * Contains states and settings for this session
 */
class StatesSingleton {
    private static _instance: StatesSingleton;
    private constructor() {}
    public static getInstance(): StatesSingleton {
        if (!this._instance) this._instance = new StatesSingleton();
        return this._instance;
    }

    public ttsEnabledUsers: string[] = []
    public ttsForAll: boolean = Config.controller.defaults.ttsForAll
    public pipeAllChat: boolean = Config.controller.defaults.pipeAllChat
    public pingForChat: boolean = Config.controller.defaults.pingForChat
    public useGameSpecificRewards: boolean = Config.controller.defaults.useGameSpecificRewards // Used in func.call(this) so reference not counted, stupid TypeScript.
    public logChatToDiscord: boolean = Config.controller.defaults.logChatToDiscord
    public updateTwitchGameCategory: boolean = Config.controller.defaults.updateTwitchGameCategory  // Used in func.call(this) so reference not counted, stupid TypeScript.
    public nonceCallbacks: Record<string, Function> = {}
    public scaleIntervalHandle: number
    public steamPlayerSummaryIntervalHandle: number // Used in func.call(this) so reference not counted, stupid TypeScript.
    public steamAchievementsIntervalHandle: number // Used in func.call(this) so reference not counted, stupid TypeScript.
    public lastSteamAppId: string|undefined // Used in func.call(this) so reference not counted, stupid TypeScript.
}