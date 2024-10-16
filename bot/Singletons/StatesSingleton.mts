import DataBaseHelper from '../Helpers/DataBaseHelper.mts'
import {ITextTagsCached} from '../Helpers/TextHelper.mts'
import {ConfigController} from '../../lib/index.mts'

/**
 * Contains states and settings for this session
 */
export default class StatesSingleton {
    private static _instance: StatesSingleton;
    private constructor() {}
    private async init() {
        const config = await DataBaseHelper.loadMain<ConfigController>(new ConfigController())
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
    public scaleIntervalHandle: number|any = -1 // TODO: Transitional node fix
    public steamPlayerSummaryIntervalHandle: number|any = -1 // TODO: Transitional node fix
    public steamAchievementsIntervalHandle: number|any = -1 // TODO: Transitional node fix
    public twitchTokenRefreshIntervalHandle: number|any = -1 // TODO: Transitional node fix
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
    public pipeLastImageFileNamePerAnchor: Map<string, string> = new Map()
}

export interface IMultiTierEventCounter {
    count: number
    timeoutHandle: number|any // TODO: Transitional node fix
    reachedMax: boolean
}