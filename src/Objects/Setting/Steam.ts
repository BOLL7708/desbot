import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingSteamAchievements extends BaseDataObject {
    achieved: string[] = []
}
export class SettingSteamGame extends BaseDataObject {
    title: string = ''
}

DataObjectMap.addRootInstance(
    new SettingSteamAchievements(),
    undefined,
    undefined,
    {achieved: 'string'}
)
DataObjectMap.addRootInstance(
    new SettingSteamGame(), '', {}, {}, 'title'
)