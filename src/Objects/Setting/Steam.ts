import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class SettingSteamAchievements extends BaseDataObject {
    achieved: string[] = []
}

DataObjectMap.addRootInstance(
    new SettingSteamAchievements(),
    undefined,
    undefined,
    {achieved: 'string'}
)