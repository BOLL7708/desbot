import EnlistData from '../../Objects/EnlistData.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {SettingTwitchReward} from '../../Objects/Setting/SettingTwitch.js'
import Utils from '../../Classes/Utils.js'
import {SettingSteamGame} from '../../Objects/Setting/SettingSteam.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import {SettingUser, SettingUserName} from '../../Objects/Setting/SettingUser.js'
import TextHelper from '../../Classes/TextHelper.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {PresetReward} from '../../Objects/Preset/PresetReward.js'
import {EventDefault} from '../../Objects/Event/EventDefault.js'
import Color from '../../Classes/ColorConstants.js'
import {ConfigPhilipsHue} from '../../Objects/Config/ConfigPhilipsHue.js'
import Data from '../../Objects/Data.js'

export default class ToolsHandler {
    constructor() {
        this.init().then()
    }
    async init() {
        EnlistData.run()

        // Get root element
        const buttonsList = document.querySelector('#toolsButtonList') as HTMLUListElement
        const resultDiv = document.querySelector('#toolsResult') as HTMLDivElement
        if(!buttonsList || !resultDiv) return

        function title(label: string) {
            const h = document.createElement('h3') as HTMLHeadingElement
            h.innerHTML = label
            return h
        }
        function li(label: string, tooltip: string, callback: (e: Event)=>Promise<string>) {
            const li = document.createElement('li')
            const button = document.createElement('button')
            const span = document.createElement('span')
            const padding = '&nbsp;&nbsp;'
            button.classList.add('main-button')
            button.innerHTML = label
            button.title = tooltip
            button.onclick = async (e) => {
                toggleButtons(false)
                span.innerHTML = `${padding}Working...`
                const result = await callback(e)
                setTimeout(()=>{ // Small delay so we can see the text change
                    span.innerHTML = `${padding}<strong>Done</strong>: ${result}`
                    toggleButtons(true)
                }, 500)
            }
            li.classList.add('row')
            li.appendChild(button)
            li.append(span)
            return li
        }
        function toggleButtons(state: boolean) {
            for(const item of items) {
                const button = item.querySelector('button')
                if(button) button.disabled = !state
            }
        }

        const items: HTMLElement[] = [
            title('Twitch'),
            li('➕ Add Twitch user',
                'Adds a new Twitch user to the system, this is helpful if you want to change their settings before they have appeared in chat.',
                async (e)=>{
                const user = new SettingUser()
                const username = await prompt('Enter Twitch username') ?? ''
                const data = await TwitchHelixHelper.getUserByLogin(username)
                if(!data) return `Did not find a Twitch user for username: ${username}`
                const exists = await DataBaseHelper.load(user, data.id)
                if(exists) return `Twitch user already exists for username: ${data.login}`
                user.userName = data.login
                user.displayName = data.display_name
                user.name = new SettingUserName()
                user.name.shortName = TextHelper.cleanName(data.login)
                user.name.datetime = Utils.getISOTimestamp()
                const result = await DataBaseHelper.save(user, data.id)
                const verb = result ? 'Added' : 'Failed to save'
                return `${verb} Twitch user: ${user.displayName}`
            }),
            li(`🔃 Load missing data for existing Twitch users`,
                'Loads associated data for a Twitch user that is missing it, like their display name and generates a short name for TTS.',
                async (e)=>{
                const allUsers = await DataBaseHelper.loadAll(new SettingUser())
                let usersUpdated = 0
                if(allUsers) {
                    for(const [userId, user] of Object.entries(allUsers)) {
                        if(user.userName && user.displayName && user.name) continue // Currently the only values to fill
                        const data = await TwitchHelixHelper.getUserById(userId)
                        if(!data) continue
                        if(!user.userName) user.userName = data.login
                        if(!user.displayName) user.displayName = data.display_name
                        if(!user.name) {
                            user.name = new SettingUserName()
                            user.name.shortName = TextHelper.cleanName(data.login)
                            user.name.datetime = Utils.getISOTimestamp()
                        }
                        const result = await DataBaseHelper.save(user, data.id)
                        if(result) usersUpdated++
                    }
                }
                return `Loaded missing data for ${usersUpdated} Twitch user(s)`
            }),
            li('🔽 Import rewards from Twitch',
                'Import any rewards that are not in the system yet from Twitch, this will create global triggers with preset and setting filled in.',
                async (e)=>{
                const rewards = await TwitchHelixHelper.getRewards()
                const existingRewards = await DataBaseHelper.loadAll(new SettingTwitchReward())
                const existingRewardIDs = Object.keys(existingRewards ?? {})
                let newRewardCount = 0
                let couldNotSaveRewardCount = 0
                let couldNotSavePresetCount = 0
                let couldNotSaveTriggerCount = 0
                for(const reward of rewards?.data ?? []) {
                    if(!existingRewardIDs.includes(reward.id)) {
                        // Create setting
                        const newReward = new SettingTwitchReward()
                        newReward.key = reward.title
                        const newRewardKey = await DataBaseHelper.save(newReward, reward.id)
                        if(!newRewardKey) continue

                        // Create preset
                        const newPreset = new PresetReward()
                        await newPreset.__apply(reward)
                        const newPresetKey = await DataBaseHelper.save(newPreset, `Preset ${TextHelper.ensureHeaderSafe(reward.title)}`)
                        if(!newPresetKey) {
                            await DataBaseHelper.delete(newReward, newRewardKey)
                            continue
                        }

                        // Create orphan trigger
                        const newTrigger = new TriggerReward()
                        const newRewardItem = await DataBaseHelper.loadItem(new SettingTwitchReward(), newRewardKey)
                        const newPresetItem = await DataBaseHelper.loadItem(new PresetReward(), newPresetKey)
                        newTrigger.rewardID = newRewardItem?.id ?? 0
                        newTrigger.rewardEntries = [newPresetItem?.id ?? 0]
                        const newTriggerKey = await DataBaseHelper.save(newTrigger, `Trigger ${TextHelper.ensureHeaderSafe(reward.title)}`)
                        if(newTriggerKey) {
                            newRewardCount++

                            // Set parent for preset
                            const newTriggerItem = await DataBaseHelper.loadItem(new TriggerReward(), newTriggerKey)
                            if(newTriggerItem) {
                                await DataBaseHelper.save(newPreset, newPresetKey, undefined, newTriggerItem.id)
                            }
                        } else {
                            await DataBaseHelper.delete(newReward, newRewardKey)
                            await DataBaseHelper.delete(newPreset, newPresetKey)
                            couldNotSaveTriggerCount++
                        }
                    }
                }
                return `Imported ${newRewardCount} rewards from Twitch, failed to save ${couldNotSaveRewardCount} reward(s), ${couldNotSavePresetCount} preset(s), and ${couldNotSaveTriggerCount} trigger(s)`
            }),
            li('🔼 Update rewards on Twitch',
                'Will apply the first preset for a reward on the rewards on Twitch, will skip updating if set to be skipped.',
                async (e)=> {
                DataBaseHelper.setFillReferences(true)
                const allEvents = await DataBaseHelper.loadAll(new EventDefault())
                DataBaseHelper.setFillReferences(false)
                let updatedRewardCount = 0
                let skippedRewardCount = 0
                let failedRewardCount = 0
                for(const [key, eventItem] of Object.entries(allEvents ?? {})) {
                    if(!eventItem.options.rewardIgnoreUpdateCommand) {
                        const triggers = Utils.ensureObjectArrayNotId(eventItem.triggers)
                        for (const trigger of triggers) {
                            if (trigger.__getClass() == TriggerReward.ref()) {
                                const triggerReward = (trigger as TriggerReward)
                                const rewardID = Utils.ensureStringNotId(triggerReward.rewardID)
                                const rewardPresets = Utils.ensureObjectArrayNotId(triggerReward.rewardEntries)
                                if (rewardID && rewardPresets.length) {
                                    const preset = rewardPresets[0] as PresetReward
                                    const response = await TwitchHelixHelper.updateReward(rewardID, preset)
                                    if (response?.data) {
                                        const success = response?.data[0]?.id == rewardID
                                        if(success) updatedRewardCount++
                                        else failedRewardCount++
                                        Utils.logWithBold(`Reward <${key}> updated: <${success ? 'OK' : 'ERR'}>`, success ? Color.Green : Color.Red)
                                        /*
                                        // TODO: Figure this out
                                        // If update was successful, also reset incremental setting as the reward should have been reset.
                                        if(Array.isArray(rewardSetup)) {
                                            const reset = new SettingIncrementingCounter()
                                            await DataBaseHelper.save(reset, pair.key)
                                        }
                                        // TODO: Also reset accumulating counters here?!
                                        */
                                    } else {
                                        failedRewardCount++
                                        Utils.logWithBold(`Reward for <${key}> update unsuccessful: ${response?.error}`, Color.Red)
                                    }
                                }
                            }
                        }
                    } else {
                        skippedRewardCount++
                        Utils.logWithBold(`Reward for <${key}> update skipped or unavailable.`, Color.Purple)
                    }
                }
                return `Updated ${updatedRewardCount} reward(s) on Twitch, skipped ${skippedRewardCount}, failed to update ${failedRewardCount}`
            }),
            title('Rewards'),
            li('⏮ Reset incrementing rewards', '', async (e)=>{
                // TODO

                return 'Reset X incrementing rewards'
            }),
            li('⏮ Reset accumulating rewards', '', async (e)=>{
                // TODO

                return 'Reset X accumulating rewards'
            }),
            li('⏮ Reset multi-tier rewards', '', async (e)=>{
                // TODO

                return 'Reset X multi-tier rewards'
            }),
            title('Steam'),
            li('➕ Add Steam game',
                'Add a Steam game before it has been detected, this so you can reference it before that.',
                async (e)=>{
                const game = new SettingSteamGame()
                let appId = await prompt('Enter Steam game app ID') ?? ''
                if(!isNaN(parseInt(appId))) appId = `steam.app.${appId}`
                const meta = await SteamStoreHelper.getGameMeta(appId)
                if(!meta || !meta.name) return `Did not find a game for app ID: ${appId}`
                const exists = await DataBaseHelper.load(game, appId)
                if(exists) return `Steam game already exists for app ID: ${appId}`
                game.title = meta.name
                const result = await DataBaseHelper.save(game, appId)
                const verb = result ? 'Added' : 'Failed to save'
                return `${verb} Steam game: ${game.title} (${appId})`
            }),
            li('🔃 Load missing data for existing Steam games',
                'Load meta data for Steam games that are missing things like title.',
                async (e)=>{
                const allGames = await DataBaseHelper.loadAll(new SettingSteamGame())
                let gamesUpdated = 0
                if(allGames) {
                    for(const [appId, game] of Object.entries(allGames)) {
                        if(game.title) continue // Currently the only value to fill
                        const meta = await SteamStoreHelper.getGameMeta(appId)
                        if(!meta || !meta.name) continue
                        game.title = meta.name
                        const result = await DataBaseHelper.save(game, appId)
                        if(result) gamesUpdated++
                    }
                }
                return `Loaded missing data for ${gamesUpdated} Steam game(s)`
            }),
            title('Philips Hue'),
            li('🔵 Connect to Philips Hue bridge',
            '',
            async (e)=>{
                const config = await DataBaseHelper.loadMain(new ConfigPhilipsHue())
                if(config.username.length && config.serverPath.length) {
                    const overwrite = confirm('Already connected to a Philips Hue bridge, do you want to overwrite the connection?')
                    if(!overwrite) return 'Cancelled due to a config already existing'
                }
                let serverPath = await prompt('Enter Philips Hue bridge server path, usually an IP address', config.serverPath) ?? ''
                serverPath = serverPath.trim()
                if(!serverPath.startsWith('http://') && !serverPath.startsWith('https://')) serverPath = `http://${serverPath}`
                alert('Please press the button on your Philips Hue bridge unit, then press OK to continue.')
                const registerResult = await PhilipsHueHelper.registerBridge(serverPath)
                if(registerResult.error.length) return `Failed to register Philips Hue bridge: ${registerResult.error}`
                config.serverPath = serverPath
                config.username = registerResult.username
                const saved = await DataBaseHelper.saveMain(config)
                return !!saved ? 'Connected to Philips Hue bridge' : 'Failed to save Philips Hue bridge connection'
            }),
            li('🔃 Reload Philips Hue devices',
                'Load all Philips Hue bulbs and plugs from your bridge unit.',
                async (e)=>{
                const result = await PhilipsHueHelper.loadLights()
                return `Reloaded ${result} Philips Hue light(s)`
            })
        ]
        buttonsList.replaceChildren(...items)
    }
}