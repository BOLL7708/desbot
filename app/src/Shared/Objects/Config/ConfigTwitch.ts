import Data, {DataEntries} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import {SettingSteamGame} from '../Setting/SettingSteam.js'

export default class ConfigTwitch extends Data {
    postTwitchClipsToDiscord: number|DataEntries<PresetDiscordWebhook> = 0 // TODO: Is there an EventSub for this so we can just post as they happen? Should still catch unposted once between streams though.
    defaultGameCategory: string = 'Games + Demos'
    gameTitleToCategoryOverride: ConfigTwitchCategoryOverride[] = []
    gameCategoryMatchSpeech: string = 'Twitch game updated: %game'
    gameCategoryNoMatchSpeech: string = 'Twitch game not matched: %game'

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigTwitch(),
            description: 'Settings for Twitch.',
            documentation: {
                postTwitchClipsToDiscord: 'Will post Twitch clips to a Discord channel if that command is run.',
                defaultGameCategory: 'The Twitch category that will be used if a game title cannot be automatically matched.',
                gameTitleToCategoryOverride: 'Manual override of game title to Twitch category for when a match is faulty or missing.',
                gameCategoryMatchSpeech: 'Message read out when the Twitch category is set automatically, clear to skip.',
                gameCategoryNoMatchSpeech: 'Message read out when the Twitch category failed to match, clear to skip.'
            },
            types: {
                postTwitchClipsToDiscord: PresetDiscordWebhook.ref.id.build(),
                gameTitleToCategoryOverride: ConfigTwitchCategoryOverride.ref.build(),
            }
        })
    }
}

export class ConfigTwitchCategoryOverride extends Data {
    game: number|DataEntries<SettingSteamGame> = 0
    category: string = ''

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigTwitchCategoryOverride(),
            documentation: {
                game: 'A Steam game where the title does not match the Twitch game category.',
                category: 'The category as seen on Twitch.'
            },
            types: {
                game: SettingSteamGame.ref.id.label.build()
            }
        })
    }
}