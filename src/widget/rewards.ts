import Config from '../ClassesStatic/Config.js'
import ModulesSingleton from '../modules_singleton.js'
import StatesSingleton from './states_singleton.js'
import Utils from './utils.js'
import {ITwitchHelixRewardConfig} from '../interfaces/itwitch_helix.js'
import {Actions} from './actions.js'
import {EEventSource} from './enums.js'
import {SettingTwitchReward} from '../Classes/settings.js'
import DB from '../ClassesStatic/DB.js'
import TwitchHelix from '../ClassesStatic/TwitchHelix.js'

export default class Rewards {
    public static async init() {
        /*
        .########..########.##......##....###....########..########...######.
        .##.....##.##.......##..##..##...##.##...##.....##.##.....##.##....##
        .##.....##.##.......##..##..##..##...##..##.....##.##.....##.##......
        .########..######...##..##..##.##.....##.########..##.....##..######.
        .##...##...##.......##..##..##.#########.##...##...##.....##.......##
        .##....##..##.......##..##..##.##.....##.##....##..##.....##.##....##
        .##.....##.########..###..###..##.....##.##.....##.########...######.
        */
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        // Load reward IDs from settings
        const storedRewards = await DB.loadSettingsDictionary(new SettingTwitchReward()) ?? {}

        // Create missing rewards if any
        const allRewardKeys = Utils.getAllEventKeys(true)
        const missingRewardKeys = allRewardKeys.filter(key => !Object.keys(storedRewards)?.find(rewardKey => rewardKey == key))
        for(const key of missingRewardKeys) {
            const config = <ITwitchHelixRewardConfig> Utils.getEventConfig(key)?.triggers.reward
            if(config) {
                const configClone = Utils.clone(Array.isArray(config) ? config[0] : config)
                configClone.title = await Utils.replaceTagsInText(configClone.title, await Actions.buildEmptyUserData(EEventSource.Created, key))
                configClone.prompt = await Utils.replaceTagsInText(configClone.prompt, await Actions.buildEmptyUserData(EEventSource.Created, key))
                let reward = await TwitchHelix.createReward(configClone)
                if(reward && reward.data && reward.data.length > 0) {
                    const newReward = new SettingTwitchReward()
                    newReward.id = reward.data[0].id
                    await DB.saveSetting(newReward, key)
                }
            } else {
                console.warn(`Reward ${key} is missing a setup.`)
            }
        }

        // Toggle TTS rewards
        TwitchHelix.updateReward(await Utils.getRewardId('Speak'), {is_enabled: !states.ttsForAll}).then()

        // Enable default rewards
        const enableRewards = Config.twitch.alwaysOnRewards.filter(rewardKey => { return !Config.twitch.alwaysOffRewards.includes(rewardKey) })
        for(const key of enableRewards) {
            TwitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: true}).then()
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.alwaysOffRewards) {
            TwitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: false}).then()
        }
    }
}