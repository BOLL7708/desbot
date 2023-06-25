import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class SettingSteamAchievements extends Data {
    achieved: string[] = []

    enlist() {
        DataMap.addRootInstance(
            new SettingSteamAchievements(),
            undefined,
            undefined,
            {achieved: 'string'}
        )
    }
}
export class SettingSteamGame extends Data {
    title: string = ''

    enlist() {
        DataMap.addRootInstance(
            new SettingSteamGame(), '', {}, {}, 'title'
        )
    }
}