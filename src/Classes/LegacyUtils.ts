import DataBaseHelper from './DataBaseHelper.js'
import {SettingTwitchReward} from '../Objects/Setting/SettingTwitch.js'

export default class LegacyUtils {
    static async getRewardId(key: string): Promise<string|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.key === key})
        return reward?.id
    }
    static async getRewardKey(id: string): Promise<string|undefined> {
        const rewards = await this.getRewardPairs()
        const reward = rewards.find((obj)=>{return obj.id === id})
        return reward?.key
    }
    static async getRewardPairs(): Promise<IRewardData[]> {
        const rewards = await DataBaseHelper.loadAll(new SettingTwitchReward()) ?? {}
        const rewardPairs: IRewardData[] = []
        for(const [id, obj] of Object.entries(rewards) as [string, SettingTwitchReward][]) {
            rewardPairs.push({key: obj.key as string, id: id})
        }
        return rewardPairs;
    }
}

interface IRewardData {
    key: string
    id: string
}