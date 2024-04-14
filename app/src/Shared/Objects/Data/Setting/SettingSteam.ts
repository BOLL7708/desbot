import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export class SettingSteamAchievements extends AbstractData {
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