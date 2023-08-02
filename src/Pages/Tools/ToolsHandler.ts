import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
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
import Twitch from '../../Classes/Twitch.js'

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

        function li(label: string, callback: (e: Event)=>Promise<string>) {
            const li = document.createElement('li')
            const button = document.createElement('button')
            const span = document.createElement('span')
            const padding = '&nbsp;&nbsp;'
            button.classList.add('main-button')
            button.innerHTML = label
            button.onclick = async (e) => {
                toggleButtons(false)
                span.innerHTML = `${padding}Working...`
                const result = await callback(e)
                setTimeout(()=>{ // Small delay so we can see the text change
                    span.innerHTML = `${padding}Done: ${result}`
                    toggleButtons(true)
                }, 500)
            }
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

        const items: HTMLLIElement[] = [
            li('Add Twitch user',  async (e)=>{
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
            li(`Load missing data for {10} Twitch users`, async (e)=>{
                // TODO
                return 'Loaded missing data for all Twitch users TODO'
            }),
            li('Add Steam game', async (e)=>{
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
            li('Load missing data for Steam games', async (e)=>{
                // TODO
                return `Loaded missing data for ${10} Steam games TODO`
            }),
            li('Reload Philips Hue lights', async (e)=>{
                const result = await PhilipsHueHelper.loadLights()
                return `Reloaded ${result} Philips Hue lights`
            }),
            li('Import rewards from Twitch', async (e)=>{
                const rewards = await TwitchHelixHelper.getRewards()
                const existingRewards = await DataBaseHelper.loadAll(new SettingTwitchReward())
                const existingRewardIDs = Object.keys(existingRewards ?? {})
                let newRewardCount = 0
                for(const reward of rewards?.data ?? []) {
                    if(!existingRewardIDs.includes(reward.id)) {
                        // TODO: Create a TRIGGER and a PRESET as well. Set the parent of the PRESET and SETTING to the TRIGGER.
                        const newReward = new SettingTwitchReward()
                        newReward.key = reward.title
                        const result = await DataBaseHelper.save(newReward, reward.id)
                        if(result) newRewardCount++
                    }
                }
                return `Imported ${newRewardCount} rewards from Twitch`
            }),
            li('Update rewards on Twitch', async (e)=>{
                // TODO
                return 'Updated X rewards on Twitch'
            }),
            li('Reset incrementing rewards', async (e)=>{
                // TODO
                return 'Reset X incrementing rewards'
            }),
            li('Reset accumulating rewards', async (e)=>{
                // TODO
                return 'Reset X accumulating rewards'
            }),
            li('Reset multi-tier rewards', async (e)=>{
                // TODO
                return 'Reset X multi-tier rewards'
            })
        ]
        buttonsList.replaceChildren(...items)
    }
}