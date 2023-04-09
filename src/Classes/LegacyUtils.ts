import DataBaseHelper from './DataBaseHelper.js'
import {SettingTwitchReward} from '../Objects/Setting/Twitch.js'
import {TKeys} from '../_data/!keys.js'

export default class LegacyUtils {
    static async getRewardId(key: TKeys): Promise<string|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.key === key})
        return reward?.id
    }
    static async getRewardKey(id: string): Promise<TKeys|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.id === id})
        return reward?.key
    }
    static async getRewardPairs(): Promise<IRewardData[]> {
        const rewards = await DataBaseHelper.loadAll(new SettingTwitchReward()) ?? {}
        const rewardPairs: IRewardData[] = []
        for(const [id, obj] of Object.entries(rewards) as [string, SettingTwitchReward][]) {
            rewardPairs.push({key: obj.key as TKeys, id: id})
        }
        return rewardPairs;
    }
}

interface IRewardData {
    key: TKeys
    id: string
}