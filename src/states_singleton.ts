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
    public ttsForAll: boolean = Config.controller.defaults.ttsForAll ?? false
    public pipeAllChat: boolean = Config.controller.defaults.pipeAllChat ?? false
    public pingForChat: boolean = Config.controller.defaults.pingForChat ?? false
    public useGameSpecificRewards: boolean = Config.controller.defaults.useGameSpecificRewards ?? false // Used in func.call(this) so reference not counted, stupid TypeScript.
    public logChatToDiscord: boolean = Config.controller.defaults.logChatToDiscord ?? false
    public updateTwitchGameCategory: boolean = Config.controller.defaults.updateTwitchGameCategory ?? false  // Used in func.call(this) so reference not counted, stupid TypeScript.
    public nonceCallbacks: Record<string, Function> = {}
    public scaleIntervalHandle: number = -1
    public steamPlayerSummaryIntervalHandle: number = -1 // Used in func.call(this) so reference not counted, stupid TypeScript.
    public steamAchievementsIntervalHandle: number = -1 // Used in func.call(this) so reference not counted, stupid TypeScript.
    public lastSteamAppId: string|undefined // Used in func.call(this) so reference not counted, stupid TypeScript.
}