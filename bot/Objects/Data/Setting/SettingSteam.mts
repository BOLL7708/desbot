import AbstractData from '../AbstractData.mts'
import DataMap from '../DataMap.mts'

export default class SettingSteamAchievements extends AbstractData {
    achieved: string[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingSteamAchievements(),
            types: {achieved: 'string'}
        })
    }
}
export class SettingSteamGame extends AbstractData {
    title: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingSteamGame(), label: 'title'
        })
    }
}