import {AbstractTrigger} from './AbstractTrigger.mts'
import {AbstractData, DataEntries} from '../AbstractData.mts'
import {DataMap, RootToolResult} from '../DataMap.mts'
import {PresetPermissions} from '../Preset/PresetPermissions.mts'
import {SettingTwitchReward} from '../Setting/SettingTwitch.mts'
import TwitchHelixHelper from '../../../../bot/Helpers/TwitchHelixHelper.mts'
import DataBaseHelper from '../../../../bot/Helpers/DataBaseHelper.mts'
import ModulesSingleton from '../../../../bot/Singletons/ModulesSingleton.mts'
import {ActionHandler} from '../../../../bot/Classes/Actions.mts'
import {DataUtils} from '../DataUtils.mts'
import {ITwitchReward} from '../../../../bot/Classes/Api/TwitchEventSub.mts'
import Utils from '../../../../bot/Utils/Utils.mts'
import {PresetReward} from '../Preset/PresetReward.mts'

export class TriggerReward extends AbstractTrigger {
    permissions: number|DataEntries<PresetPermissions> = 0
    rewardEntries: number[]|DataEntries<AbstractData> = [] // TODO: This is <Data> just to give it a parent, need to update this so it's not generic.
    rewardID: number|DataEntries<SettingTwitchReward> = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerReward(),
            tag: '🎁',
            description: 'This is a Twitch Channel Point Reward, triggered by a redemption on your channel page.',
            documentation: {
                permissions: 'Permission for who can redeem this reward, leave this empty to not restrict it.',
                rewardEntries: 'One or multiple reward presets. The first will be used on updates/resets, more are only needed when using a non-default event behavior.',
                rewardID: 'This is a reference to the reward on Twitch, leave empty to have it create a new reward when running the widget.'
            },
            types: {
                permissions: PresetPermissions.ref.id.build(),
                rewardID: SettingTwitchReward.ref.id.label.build(),
                rewardEntries: AbstractData.genericRef('PresetReward').build() // I believe this was done to give these items a parent
            },
            tools: {
                rewardID: {
                    label: 'Create reward on Twitch',
                    documentation: 'For this to succeed you need at least one preset added to Reward Entries.',
                    filledInstance: true,
                    callback: async <TriggerReward extends AbstractData>(instance: TriggerReward&AbstractData): Promise<RootToolResult> => {

                        // @ts-ignore For some inexplicable reason TSC does not recognize that the instance has the properties on it even if the IDE and browser console says it is the right class.
                        const entries = DataUtils.ensureDataArray<PresetReward>(instance.rewardEntries) ?? []
                        // @ts-ignore same here
                        const id = DataUtils.ensureData<SettingTwitchReward>(instance.rewardID)

                        const result = new RootToolResult()
                        if(id) {
                            result.message = 'There is already a reward selected, will skip creating a new one.'
                            return result
                        }

                        if(entries.length > 0) {
                            const entry = entries[0]
                            const response = await TwitchHelixHelper.createReward(entry)
                            if(response.data && response.data.length > 0) {
                                const rewardData = response.data[0]
                                const settingReward = new SettingTwitchReward()
                                settingReward.key = rewardData.title
                                const saved = await DataBaseHelper.save(settingReward, rewardData.id)
                                if(saved !== undefined) {
                                    const item = await DataBaseHelper.loadItem(new SettingTwitchReward(), saved)
                                    if(item !== undefined) {
                                        result.message = 'Created the reward on Twitch and saved it to the database.'
                                        result.success = true
                                        result.data = item.id
                                    } else result.message = 'Failed to load the reward from the database.'
                                } else result.message = 'Failed to save the reward to the database.'
                            } else result.message = `Failed to create the reward on Twitch, [${response.error}]: ${response.message}`
                        } else result.message = 'No reward entries found, this is needed to create the reward.'
                        return result
                    }
                }
            }
        })
    }

    register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const handler = new ActionHandler(eventKey)
        const rewardPreset = DataUtils.ensureItem(this.rewardID)
        if(rewardPreset) {
            const reward: ITwitchReward = { id: rewardPreset.dataSingle.key, handler }
            modules.twitchEventSub.registerReward(reward)
        } else {
            Utils.logWithBold(`No Reward ID for <${eventKey}>, it might be missing a reward config.`, 'red')
        }
    }
}