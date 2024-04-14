import EnlistData from '../../../Shared/Objects/Data/EnlistData.js'
import {SettingUser, SettingUserName} from '../../../Shared/Objects/Data/Setting/SettingUser.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import {DataUtils} from '../../../Shared/Objects/Data/DataUtils.js'
import Utils from '../../../Shared/Utils/Utils.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import {EventDefault} from '../../../Shared/Objects/Data/Event/EventDefault.js'
import {SettingSteamGame} from '../../../Shared/Objects/Data/Setting/SettingSteam.js'
import SteamStoreHelper from '../../../Shared/Helpers/SteamStoreHelper.js'
import PhilipsHueHelper from '../../../Shared/Helpers/PhilipsHueHelper.js'
import {SettingTwitchReward} from '../../../Shared/Objects/Data/Setting/SettingTwitch.js'
import {PresetReward} from '../../../Shared/Objects/Data/Preset/PresetReward.js'
import {TriggerReward} from '../../../Shared/Objects/Data/Trigger/TriggerReward.js'
import {ConfigPhilipsHue} from '../../../Shared/Objects/Data/Config/ConfigPhilipsHue.js'
import {PresetDiscordWebhook} from '../../../Shared/Objects/Data/Preset/PresetDiscordWebhook.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'

export default class ToolsHandler {
    private TextHelper: any
    constructor() {
        this.init().then()
    }
    async init() {
        EnlistData.run()

        // Get root element
        const buttonsList = document.querySelector('#toolsButtonList') as HTMLUListElement
        const resultDiv = document.querySelector('#toolsResult') as HTMLDivElement
        if(!buttonsList || !resultDiv) return

        function title(label: string): HTMLHeadingElement {
            const h = document.createElement('h3') as HTMLHeadingElement
            h.innerHTML = label
            return h
        }
        function description(text: string): HTMLParagraphElement {
            const p = document.createElement('p') as HTMLParagraphElement
            p.innerHTML = text
            return p
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
            description('Various tools to retrieve and transmit Twitch data like users and rewards.'),
            li('➕ Add Twitch user',
                'Adds a new Twitch user to the system, this is helpful if you want to change their settings before they have appeared in chat.',
                async (e)=>{
                const user = new SettingUser()
                const username = await prompt('Enter Twitch username') ?? ''
                const data = await TwitchHelixHelper.getUserByLogin(username)
                if(!data) return `Did not find a Twitch user for username: ${username}`
                else return `Twitch user was created if it was missing for username: ${data.login}`
            }),
            li(`🔃 Load missing data for existing Twitch users`,
                'Loads associated data for a Twitch user that is missing it, like their display name and generates a short name for TTS.',
                async (e)=>{
                const allUsers = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new SettingUser()) ?? {})
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
                            user.name.shortName = this.TextHelper.cleanName(data.login)
                            user.name.datetime = Utils.getISOTimestamp()
                        }
                        const result = await DataBaseHelper.save(user, data.id)
                        if(result) usersUpdated++
                    }
                }
                return `Loaded missing data for ${usersUpdated} Twitch user(s)`
            }),
            li('🔽 Import manageable rewards from Twitch',
                'Import only manageable (by the bot) rewards that are not in the system yet from Twitch, this will create global triggers with the preset and setting filled in.',
                buildImportTwitchRewardsCallback(true)
            ),
            li('🔽 Import any rewards from Twitch',
                'Import manageable (by the bot) and unmanageable rewards that are not in the system yet from Twitch, this will create global triggers with the preset and setting filled in.',
                buildImportTwitchRewardsCallback(false)
            ),
            li('🔼 Update rewards on Twitch',
                'Will apply the first preset for a reward on the rewards on Twitch, will skip updating if set to be skipped.',
                async (e)=> {
                const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(
                    new EventDefault()
                ) ?? {})
                const result = await TwitchHelixHelper.updateRewards(allEvents)
                return `Updated ${result.updated} reward(s) on Twitch, skipped ${result.skipped}, failed to update ${result.failed}`
            }),
            /*
            li('➕ (DISABLED) Create missing rewards on Twitch',
                'Will create new rewards on Twitch for events missing a reward ID while containing a reward preset.',
                async (e)=> {
                return 'Disabled because it is acting up on Multi Tier events for some reason...'
                const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(
                    new EventDefault()
                ) ?? {})
                let createdCount = 0
                let errorCount = 0
                let failedCount = 0
                for(const [eventKey, event] of Object.entries(allEvents ?? {})) {
                    const rewardTriggers = await event.getTriggersWithKeys(new TriggerReward())
                    for(const [triggerKey, trigger] of Object.entries(rewardTriggers)) {
                        const rewardID = DataUtils.ensureKey(trigger.rewardID)
                        const rewards = DataUtils.ensureDataArray(trigger.rewardEntries)
                        if(rewardID.length > 0 && rewards.length > 0) {
                            const rewardPreset = rewards[0] as PresetReward // TODO: Might be able to get rid of this cast with more parent support
                            if(rewardPreset) {
                                const response = await TwitchHelixHelper.createReward(rewardPreset)
                                const id = response?.data?.pop()?.id
                                if(id) {
                                    const setting = new SettingTwitchReward()
                                    setting.key = rewardPreset.title
                                    const newKey = await DataBaseHelper.save(setting, id)
                                    if(newKey) {
                                        createdCount++
                                        trigger.rewardID = await DataBaseHelper.loadID(SettingTwitchReward.ref.build(), newKey)
                                        await DataBaseHelper.save(trigger, triggerKey)
                                    }
                                    else errorCount++
                                } else {
                                    failedCount++
                                }
                            }
                        }
                    }
                }
                return `Created ${createdCount} reward(s) on Twitch, failed to create ${errorCount} reward(s), failed to save ${failedCount} reward(s)`
            }),
            title('Rewards'),
            li('⏮ (TODO) Reset incrementing rewards', '', async (e)=>{
                // TODO

                return 'Reset X incrementing rewards'
            }),
            li('⏮ (TODO) Reset accumulating rewards', '', async (e)=>{
                // TODO

                return 'Reset X accumulating rewards'
            }),
            li('⏮ (TODO) Reset multi-tier rewards', '', async (e)=>{
                // TODO

                return 'Reset X multi-tier rewards'
            }),
            */
            title('Steam'),
            description('Various tools for retrieving Steam game data.'),
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
                const allGames = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new SettingSteamGame()) ?? {})
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
            description('Various tools for connecting to a Philips Hue bridge and loading bulbs and sockets.'),
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
                return `Reloaded Philips Hue light(s): `+JSON.stringify(result)
            }),
            title('Development'),
            description('Various tools for development and debugging. Only use these if you know what they are meant for, and check the tooltip instructions in detail so you do not sabotage your setup by accident.'),
            li('🔴 OVERWRITE ALL DISCORD WEBHOOK URLS',
                'Use this to overwrite all your current webhook URLs, this is meant to be used so you in a debug version of the bot can output all webhook calls to the same debug webhook avoiding spamming your live channels. There is no undo, so only do this in a test version of the bot or after you have backed up your database so you can restore it.',
                async (e)=>{
                const newURL = prompt('Enter new Discord webhook URL') ?? ''
                if(!newURL.length) return 'Cancelled'
                let total = 0, ok = 0
                const webhooks = await DataBaseHelper.loadAll(new PresetDiscordWebhook())
                for(const item of Object.values(webhooks ?? {})) {
                    const webhook = item.filledData
                    if(webhook) {
                        webhook.url = newURL
                        const key = await DataBaseHelper.save(webhook, item.key)
                        total++
                        if(key) ok++
                    }
                }
                return `Updated webhooks: ${ok}/${total}`
            }),
        ]
        buttonsList.replaceChildren(...items)

        function buildImportTwitchRewardsCallback(onlyMaintainable: boolean): (e: Event)=>Promise<string> {
            return async (e)=>{
                const rewards = await TwitchHelixHelper.getRewards(onlyMaintainable)
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
                        await newPreset.__apply(reward, false)
                        const newPresetKey = await DataBaseHelper.save(newPreset, `Preset ${TextHelper.ensureHeaderSafe(reward.title)}`)
                        if(!newPresetKey) {
                            await DataBaseHelper.delete(newReward, newRewardKey)
                            continue
                        }

                        // Create orphan trigger
                        const newTrigger = new TriggerReward()
                        const newRewardID = await DataBaseHelper.loadID(SettingTwitchReward.ref.build(), newRewardKey)
                        const newPresetID = await DataBaseHelper.loadID(PresetReward.ref.build(), newPresetKey)
                        newTrigger.rewardID = newRewardID
                        newTrigger.rewardEntries = [newPresetID]
                        const newTriggerKey = await DataBaseHelper.save(newTrigger, `Trigger ${TextHelper.ensureHeaderSafe(reward.title)}`)
                        if(newTriggerKey) {
                            newRewardCount++

                            // Set parent for preset
                            const newTriggerID = await DataBaseHelper.loadID(TriggerReward.ref.build(), newTriggerKey)
                            if(newTriggerID) {
                                await DataBaseHelper.save(newPreset, newPresetKey, undefined, newTriggerID)
                            }
                        } else {
                            await DataBaseHelper.delete(newReward, newRewardKey)
                            await DataBaseHelper.delete(newPreset, newPresetKey)
                            couldNotSaveTriggerCount++
                        }
                    }
                }
                return `Imported ${newRewardCount} rewards from Twitch, failed to save ${couldNotSaveRewardCount} reward(s), ${couldNotSavePresetCount} preset(s), and ${couldNotSaveTriggerCount} trigger(s)`
            }
        }
    }
}