import StatesSingleton from '../Singletons/StatesSingleton.js'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.js'
import LegacyUtils from '../Utils/LegacyUtils.js'

export default class Rewards {
    public static async init() {
        const states = StatesSingleton.getInstance()

        /* TODO: Make this a tool instead.
        // Load reward IDs from settings
        const storedRewards = await DataBaseHelper.loadAll(new SettingTwitchReward()) ?? {}

        // Create missing rewards if any
        const allRewardKeys = Utils.getAllEventKeys(true)
        const missingRewardKeys = allRewardKeys.filter(key => !Object.values(storedRewards)?.find(rewardData => rewardData.key == key))
        for(const key of missingRewardKeys) {
            const config = <ITwitchHelixRewardConfig> Utils.getEventConfig(key)?.triggers.reward
            if(config) {
                const configClone = Utils.clone(Array.isArray(config) ? config[0] : config)
                configClone.title = await TextHelper.replaceTagsInText(configClone.title, await Actions.buildEmptyUserData(EEventSource.Created, key))
                configClone.prompt = await TextHelper.replaceTagsInText(configClone.prompt, await Actions.buildEmptyUserData(EEventSource.Created, key))
                let reward = await TwitchHelixHelper.createReward(configClone)
                if(reward && reward.data && reward.data.length > 0) {
                    const newReward = new SettingTwitchReward()
                    newReward.key = key
                    await DataBaseHelper.save(newReward, reward.data[0].id)
                }
            } else {
                console.warn(`Reward ${key} is missing a setup.`)
            }
        }
         */

        // Toggle TTS rewards
        TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId('Speak'), {is_enabled: !states.ttsForAll}).then()

        /* TODO: Re-implement reward toggling.
        // Enable default rewards
        const enableRewards = Config.twitch.alwaysOnRewards.filter(rewardKey => { return !Config.twitch.alwaysOffRewards.includes(rewardKey) })
        for(const key of enableRewards) {
            TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(key), {is_enabled: true}).then()
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.alwaysOffRewards) {
            TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(key), {is_enabled: false}).then()
        }
        */
    }
}