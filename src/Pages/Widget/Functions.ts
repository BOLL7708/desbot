import {IEvent} from '../../Interfaces/ievents.js'
import {ActionHandler, Actions} from './Actions.js'
import Config from '../../Classes/Config.js'
import OpenVR2WS from '../../Classes/OpenVR2WS.js'
import Color from '../../Classes/ColorConstants.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import {ITwitchHelixChannelRequest} from '../../Interfaces/itwitch_helix.js'
import SteamWebHelper from '../../Classes/SteamWebHelper.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Utils from '../../Classes/Utils.js'
import {EEventSource} from './Enums.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import {TKeys} from '../../_data/!keys.js'
import {SettingSteamAchievements, SettingSteamGame} from '../../Objects/Setting/Steam.js'
import {ConfigSteam} from '../../Objects/Config/Steam.js'
import TextHelper from '../../Classes/TextHelper.js'
import LegacyUtils from '../../Classes/LegacyUtils.js'
import ConfigTwitchChat from '../../Objects/Config/TwitchChat.js'
import TempFactory from '../../Classes/TempFactory.js'
import ConfigTwitch from '../../Objects/Config/Twitch.js'

export default class Functions {
    /*
    .########.##.....##.##....##..######..########.####..#######..##....##..######.
    .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
    .##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
    .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
    .##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
    .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
    .##........#######..##....##..######.....##....####..#######..##....##..######.
    */
    public static async setEmptySoundForTTS() {
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()
        const twitchChatConfig = await DataBaseHelper.loadMain(new ConfigTwitchChat())
        const audio = states.pingForChat ? Utils.ensureObjectNotId(twitchChatConfig.soundEffectOnEmptyMessage) : undefined
        if(audio) modules.tts.setEmptyMessageSound(TempFactory.configAudio(audio))
    }

    public static async appIdCallback(appId: string, isVr: boolean) {
        // Skip if we should ignore this app ID.
        const steamConfig = await DataBaseHelper.loadMain(new ConfigSteam())
        if(steamConfig.ignoredAppIds.indexOf(appId) !== -1) return console.log(`Steam: Ignored AppId: ${appId}`)
        const twitchConfig = await DataBaseHelper.loadMain(new ConfigTwitch())

		// Init
		const modules = ModulesSingleton.getInstance()
		const states = StatesSingleton.getInstance()
		states.lastSteamAppIsVR = isVr // TODO: Had deleted this before, possibly for 2D streaming, is this faulty and should be moved?

        // region Controller Options Toggling

        // Skip if it's the last app ID again.
        if(appId.length > 0) {
            if(appId == states.lastSteamAppId) return
            Utils.log(`Steam AppId is new: "${appId}" != "${states.lastSteamAppId}", isVr: ${isVr}`, Color.DarkBlue)
            states.lastSteamAppId = appId
            
			// Load achievements before we update the ID for everything else, so we don't overwrite them by accident. (2022-10-01: Not sure if this is still needed)
            await DataBaseHelper.load(new SettingSteamAchievements(), appId)
            await SteamWebHelper.getGameSchema(appId)
            await SteamWebHelper.getGlobalAchievementStats(appId)
            await Functions.loadAchievements()

            // Save reference to current game, for use in the editor.
            const appIdNumber = Utils.numberFromAppId(appId)
            if(SteamWebHelper._gameSchemas.has(appIdNumber)) {
                const gameSchema = SteamWebHelper._gameSchemas.get(appIdNumber)
                if(gameSchema) {
                    const steamGame = new SettingSteamGame()
                    steamGame.title = gameSchema.game.gameName
                    await DataBaseHelper.save(steamGame, appId)
                }
            }

			/**
			 * Controller defaults loading, various settings including TTS etc.
			 */
            const controllerGameDefaults = Config.controller.gameDefaults[appId]
            let combinedSettings = Config.controller.defaults
            if(controllerGameDefaults) {
                combinedSettings = {...combinedSettings, ...controllerGameDefaults}
                Utils.log(`Applying controller settings for: ${appId}`, Color.Green )
            } else {
                // No merging here as there is no merging to do but we still log it to the console.
                Utils.log(`Applying default, as no controller settings for: ${appId}`, Color.Green )
            }
            
            // We run the TTS command events due to doing more things than just toggling the flag.
            const ttsUser = await Actions.buildEmptyUserData(EEventSource.AutoCommand, 'Unknown')
            if(combinedSettings.ttsForAll) new ActionHandler('TtsOn').call(ttsUser).then()
            else new ActionHandler('TtsOff').call(ttsUser).then()

            states.pipeAllChat = combinedSettings.pipeAllChat ?? false
            states.pingForChat = combinedSettings.pingForChat ?? false
            this.setEmptySoundForTTS.call(this).then() // Needed as that is down in a module and does not read the flag directly.
            states.logChatToDiscord = combinedSettings.logChatToDiscord ?? false
            states.useGameSpecificRewards = combinedSettings.useGameSpecificRewards ?? false // OBS: Running the command for this will create infinite loop.
            states.updateTwitchGameCategory = combinedSettings.updateTwitchGameCategory ?? false
        }
        // endregion

        // region Update Event Options
        const eventOptions = Config.twitch.eventOptionsPerGame[appId] ?? {}
        const allEventOptionsKeys = [
            ...new Set( // All unique keys
                [
                    ...Object.keys(Config.twitch.eventOptionsDefault) as TKeys[],
                    ...Object.keys(eventOptions) as TKeys[]
                ]
            )
        ]
        for(let key of allEventOptionsKeys) {
            const eventRef = Config.events[key]
            if(eventRef) {
                // Update live options with new values.
                eventRef.options = {
                    ...( eventRef.options ?? {} ),
                    ...( Config.twitch.eventOptionsDefault[key] ?? {} ),
                    ...( eventOptions[key] ?? {} )
                }
                Utils.log(`Updating event "${key}" options: ${Object.keys(eventRef.options).join(', ')}`, Color.DarkOliveGreen)
                if(eventRef.triggers.reward) {
                    let rewardConfigClone = Utils.clone(Utils.ensureArray(eventRef.triggers.reward)[0])
                    if(rewardConfigClone) {
                        Utils.log(`Updating reward for event "${key}" to be in line with options.`, Color.DarkOliveGreen)
                        rewardConfigClone.title = await TextHelper.replaceTagsInText(rewardConfigClone.title, await Actions.buildEmptyUserData(EEventSource.Updated, key))
                        rewardConfigClone.prompt = await TextHelper.replaceTagsInText(rewardConfigClone.prompt, await Actions.buildEmptyUserData(EEventSource.Updated, key))
                        TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(key), rewardConfigClone).then()
                    }
                }
            }
        }
        // endregion

        // region Reward Toggling

		/**
         * Check if LIV is running, this will toggle rewards in that callback.
         */
        modules.openvr2ws.findOverlay(OpenVR2WS.OVERLAY_LIV_MENU_BUTTON) // TODO: Should this be hard-coded?

        /**
         * General reward toggling
         */
        const defaultProfile = isVr ? Config.twitch.rewardProfileDefaultVR : Config.twitch.rewardProfileDefault
        const gameProfile = Config.twitch.rewardProfilePerGame[appId]
        let profileToUse: {[key: string]: boolean} = {}
        if(appId.length == 0) {
            Utils.log(`Applying NO GAME reward profile as no app ID`, Color.Green, true, true)
            profileToUse = { ...defaultProfile, ...Config.twitch.rewardProfileNoGame }
			Utils.log(`--> merging [default${isVr?' vr':''}](${Object.keys(defaultProfile).length}) with [no game](${Object.keys(Config.twitch.rewardProfileNoGame).length}) to [merged](${Object.keys(profileToUse).length})`, Color.Gray)
        } else if(gameProfile != undefined) {
            Utils.log(`Applying GAME reward profile for: ${appId}`, Color.Green, true, true)
			profileToUse = {...defaultProfile, ...gameProfile}
			Utils.log(`--> merging [default${isVr?' vr':''}](${Object.keys(defaultProfile).length}) with [game](${Object.keys(gameProfile).length}) to [merged](${Object.keys(profileToUse).length})`, Color.Gray)
        } else {
            Utils.log(`Applying DEFAULT, as no game reward profile for: ${appId}`, Color.Green, true, true)
            profileToUse = defaultProfile
            Utils.log(`--> using [default${isVr?' vr':''}](${Object.keys(defaultProfile).length})`, Color.Gray)
        }

        // Update rewards

        /**
         * Toggle individual rewards on/off depending on the app ID.
         *
         * At one point, I fixed something that was messing things up for Doc, I think his main profiles were overridden.
         * So I switched to setting a fixed value, but this is also not what was originally intended.
         * I've changed it so we set a value if the game is included, then we only set the opposite value if the key is not set yet.
         */
        for(const rewardKey of Object.keys(Config.twitch.turnOnRewardForGames)) {
            let games = Config.twitch.turnOnRewardForGames[rewardKey as TKeys] ?? []
            Utils.log(`--> will turn on reward '${rewardKey}' depending on game.`, Color.Gray)
            if(games.includes(appId)) profileToUse[rewardKey] = true
            else if (!Object.keys(profileToUse).includes(rewardKey)) profileToUse[rewardKey] = false
        }
        for(const rewardKey of Object.keys(Config.twitch.turnOffRewardForGames)) {
            let games = Config.twitch.turnOffRewardForGames[rewardKey as TKeys] ?? []
            Utils.log(`--> will turn off reward '${rewardKey}' depending on game.`, Color.Gray)
            if(games.includes(appId)) profileToUse[rewardKey] = false
            else if (!Object.keys(profileToUse).includes(rewardKey)) profileToUse[rewardKey] = true
        }

        /**
         * Game specific reward configuration
         */
        const allGameRewardKeys = Utils.getAllEventKeysForGames(true)
        const gameSpecificRewards = states.useGameSpecificRewards ? Utils.getEventsForGame(appId) : undefined
        const availableGameRewardKeys = gameSpecificRewards != undefined ? Object.keys(gameSpecificRewards) : []
        const unavailableGameRewardKeys = allGameRewardKeys.filter((key) => !availableGameRewardKeys.includes(key))

        // Disable all reusable generic rewards that are not in use.
        for(const rewardKey of unavailableGameRewardKeys) {
            profileToUse[rewardKey] = false
        }

        if(gameSpecificRewards) {
            // Update and enable all reusable generic rewards in use.
            for(const [key, event] of Object.entries(gameSpecificRewards) as [TKeys, IEvent][]) {
                const thisEvent = event ?? {triggers: {}}
                const defaultEvent = Config.events[key] ?? {triggers: {}}
                const rewardConfig = thisEvent.triggers.reward ?? {}
                const defaultRewardConfig = defaultEvent.triggers.reward ?? {}
                delete profileToUse[key] // Delete any state set elsewhere as this overrides and is handled here to reduce number of updates needed.
                const rewardId = await LegacyUtils.getRewardId(key)
                Utils.logWithBold(`Updating Game Reward: <${key}:${rewardId}>`, Color.Purple)

                // Update game rewards on Twitch
                TwitchHelixHelper.updateReward(rewardId, {
                    ...defaultRewardConfig,
                    ...rewardConfig,
                    ...{is_enabled: true}
                }).then()
                // Update game reward actions
                Actions.registerReward(key, appId).then()
            }
        }

        // Apply always on/off filters
        for(const rewardKey of Config.twitch.alwaysOnRewards) {
            profileToUse[rewardKey] = true
        }
        for(const rewardKey of Config.twitch.alwaysOffRewards) {
            profileToUse[rewardKey] = false
        }

        Utils.log(`Toggling rewards (${Object.keys(profileToUse).length}) except active game rewards (${availableGameRewardKeys.length}) which are handled separately.`, Color.Green, true, true)
        console.log(profileToUse)
        TwitchHelixHelper.toggleRewards(profileToUse).then()

        // endregion

        // region Misc

		/*
		.##...##..######...####....####..
		.###.###....##....##......##..##.
		.##.#.##....##.....####...##.....
		.##...##....##........##..##..##.
		.##...##..######...####....####..
		*/

        // Show game in sign
        if(appId.length > 0) {
            const gameData = await SteamStoreHelper.getGameMeta(appId)
            const price = SteamStoreHelper.getPrice(gameData)
            const name = gameData?.name ?? 'N/A'
            modules.sign.enqueueSign({
                title: 'Current Game',
                image: gameData?.header_image,
                subtitle: `${name}\n${price}`,
                durationMs: 20000
            })
        }

        // Update category on Twitch
        if(appId.length > 0 && states.updateTwitchGameCategory) {
            const gameData = await SteamStoreHelper.getGameMeta(appId)
            let gameName = gameData?.name ?? ''
            const override = twitchConfig.gameTitleToCategoryOverride.find((override)=>{ return Utils.ensureObjectNotId(override.game)?.title == gameName })
            if(override) {
                gameName = override.category
            }
            let twitchGameData = await TwitchHelixHelper.searchForGame(gameName)
            if(twitchGameData == null && typeof gameData?.name == 'string') {
                let nameParts = gameData.name.split(' ')
                if(nameParts.length >= 2) {
                    // This is to also match games that are "name VR" on Steam but "name" on Twitch
                    // so we effectively trim off VR and see if we get a match.
                    nameParts.pop()
                    twitchGameData = await TwitchHelixHelper.searchForGame(nameParts.join(' '))
                }
            }
            if(twitchGameData == null) {
                // If still no Twitch match, we load a possible default category.
                twitchGameData = await TwitchHelixHelper.searchForGame(twitchConfig.defaultGameCategory)
            }
            if(twitchGameData != undefined) {
                const request: ITwitchHelixChannelRequest = {
                    game_id: twitchGameData.id
                }
                const response = await TwitchHelixHelper.updateChannelInformation(request)
                const speech = Config.controller.speechReferences['CallbackAppID'] ?? []
                Utils.log(`Steam title: ${gameData?.name} -> Twitch category: ${twitchGameData.name}`, Color.RoyalBlue)
                if(response) {
                    await modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech[0], {game: twitchGameData.name}))
                } else {
                    await modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech[1], {game: gameData?.name ?? 'N/A'}))
                }
            } else {
                Utils.log(`Steam title: ${gameData?.name} did not match any Twitch Category`, Color.Red)
            }
        }
        // endregion
    }

    // region Steam Web API
    public static async loadPlayerSummary() {
        const summary = await SteamWebHelper.getPlayerSummary()
        const id = Utils.toInt(summary?.gameid)
        Utils.log(`Steam player summary loaded, game ID: ${id}`, Color.Gray)
        if(!isNaN(id) && id > 0) await Functions.appIdCallback(`steam.app.${id}`, false)
    }

    private static _isLoadingAchievements = false
    public static async loadAchievements() {
        if(this._isLoadingAchievements) return Utils.log('Steam achievements already loading', Color.Red)
        this._isLoadingAchievements = true
        const modules = ModulesSingleton.getInstance()
        const lastSteamAppId = StatesSingleton.getInstance().lastSteamAppId // Storing this in case it could change during execution?!
        if(lastSteamAppId && lastSteamAppId.length > 0) {
            // Local
            const steamConfig = await DataBaseHelper.loadMain(new ConfigSteam())
            const steamAchievements = await DataBaseHelper.load(new SettingSteamAchievements(), lastSteamAppId) ?? new SettingSteamAchievements()
            const doneAchievements = steamAchievements.achieved.length

            // Remote
            const achievements = await SteamWebHelper.getAchievements(lastSteamAppId) ?? []
            let countNew = 0
            for(const achievement of achievements) {
                // Check if the state has changed since last stored
                const newAchievement = !steamAchievements.achieved.includes(achievement.apiname)
                const isAchieved = achievement.achieved > 0
                if(newAchievement && isAchieved) {
                    countNew++

                    // Update achievement state
                    steamAchievements.achieved.push(achievement.apiname)

                    // Announce achievement
                    if(new Date(achievement.unlocktime*1000).getTime() >= new Date().getTime() - (steamConfig.ignoreAchievementsOlderThanHours * 60 * 60 * 1000)) {
                        Utils.log(`New achievement unlocked! ${achievement.apiname}`, Color.Green, true, true)
                        const key = achievement.apiname
                        const profileTag = await SteamWebHelper.getProfileTag()
                        const gameMeta = await SteamStoreHelper.getGameMeta(lastSteamAppId)
                        const gameSchema = await SteamWebHelper.getGameSchema(lastSteamAppId)
                        const globalAchievementStat = (await SteamWebHelper.getGlobalAchievementStats(lastSteamAppId))?.find(s => s.name == key)
                        const achievementDetails = gameSchema?.game?.availableGameStats?.achievements?.find(a => a.name == key)
                        const totalAchievements = achievements.length
                        const progressStr = `${doneAchievements+countNew}/${totalAchievements}`
                        const globalStr = globalAchievementStat?.percent.toFixed(1)+'%' ?? 'N/A'
                        
                        // Discord
                        DiscordUtils.enqueuePayload(Config.credentials.DiscordWebhooks['CallbackAchievement'] ?? '', {
                            username: gameMeta?.name ?? 'N/A',
                            avatar_url: gameMeta?.header_image ?? '',
                            embeds: [
                                {
                                    title: achievementDetails?.displayName ?? key,
                                    description: achievementDetails?.description ?? '',
                                    url: SteamStoreHelper.getAchievementsURL(lastSteamAppId, profileTag),
                                    thumbnail: {
                                        url: achievementDetails?.icon ?? ''
                                    },
                                    timestamp: new Date(achievement.unlocktime*1000).toISOString(),
                                    footer: {
                                        text: TextHelper.replaceTags(
                                            steamConfig.achievementDiscordFooter,
                                            {
                                                progress: progressStr, 
                                                rate: globalAchievementStat?.percent.toFixed(1)+'%' ?? 'N/A'
                                            }
                                        )
                                    }
                                }
                            ]
                        })

                        // Twitch chat
                        modules.twitch._twitchChatOut.sendMessageToChannel(
                            TextHelper.replaceTags(
                                steamConfig.achievementTwitchChatMessage,
                                {
                                    progress: progressStr, 
                                    name: achievementDetails?.displayName ?? key, 
                                    text: achievementDetails?.description ?? 'N/A', 
                                    rate: globalStr
                                }
                            )
                        )
                    }
                }
            }
            if(steamAchievements.achieved.length > doneAchievements) {
                console.log("Save Achievements", steamAchievements, lastSteamAppId)
                await DataBaseHelper.save(steamAchievements, lastSteamAppId) // Update states in DataBaseHelper
            }
            this._isLoadingAchievements = false
        } else {
            this._isLoadingAchievements = false
        }
    }
    // endregion
}