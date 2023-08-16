import {IMultiTierEventCounter, ITextTagsCached} from '../Interfaces/iactions.js'
import {ConfigController} from '../Objects/Config/ConfigController.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'

/**
 * Contains states and settings for this session
 */
export default class StatesSingleton {
    private static _instance: StatesSingleton;
    private constructor() {}
    private async init() {
        const config = await DataBaseHelper.loadMain(new ConfigController())
        this.ttsForAll = config.stateDefaults.ttsForAll
        this.pipeAllChat = config.stateDefaults.pipeAllChat
        this.pingForChat = config.stateDefaults.pingForChat
        // this.useGameSpecificRewards = config.stateDefaults.useGameSpecificRewards TODO
        this.logChatToDiscord = config.stateDefaults.logChatToDiscord
        this.updateTwitchGameCategory = config.stateDefaults.updateTwitchGameCategory
        this.runRemoteCommands = config.stateDefaults.runRemoteCommands
    }
    public static async initInstance() {
        await this.getInstance().init()
    }
    public static getInstance(): StatesSingleton {
        if (!this._instance) this._instance = new StatesSingleton();
        return this._instance;
    }

    public ttsEnabledUsers: string[] = []
    public ttsForAll: boolean = false
    public pipeAllChat: boolean = false
    public pingForChat: boolean = false
    public useGameSpecificRewards: boolean = false
    public logChatToDiscord: boolean = false
    public updateTwitchGameCategory: boolean = false
    public nonceCallbacks: Map<string, Function> = new Map()
    public scaleIntervalHandle: number = -1
    public steamPlayerSummaryIntervalHandle: number = -1
    public steamAchievementsIntervalHandle: number = -1
    public lastSteamAppId: string|undefined 
    public lastSteamAppIsVR: boolean = false
    public runRemoteCommands: boolean = false
    public textTagCache: ITextTagsCached = {
        lastDictionaryWord: '',
        lastDictionarySubstitute: '',
        lastTTSSetNickLogin: '',
        lastTTSSetNickSubstitute: ''
    }
    public multiTierEventCounters: Map<string, IMultiTierEventCounter> = new Map()
    public pipeLastImageFileNamePerAnchor: Map<number, string> = new Map()
}