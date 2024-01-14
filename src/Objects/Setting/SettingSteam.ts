import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingSteamAchievements extends Data {
    achieved: string[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingSteamAchievements(),
            types: {achieved: 'string'}
        })
    }
}
export class SettingSteamGame extends Data {
    title: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new SettingSteamGame(), label: 'title'
        })
    }
}