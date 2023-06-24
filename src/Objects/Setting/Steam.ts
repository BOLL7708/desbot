import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingSteamAchievements extends BaseDataObject {
    achieved: string[] = []

    register() {
        DataObjectMap.addRootInstance(
            new SettingSteamAchievements(),
            undefined,
            undefined,
            {achieved: 'string'}
        )
    }
}
export class SettingSteamGame extends BaseDataObject {
    title: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new SettingSteamGame(), '', {}, {}, 'title'
        )
    }
}