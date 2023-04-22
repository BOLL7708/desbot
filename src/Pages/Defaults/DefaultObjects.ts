import BaseDataObject from '../../Objects/BaseDataObject.js'
import {PresetPermissions} from '../../Objects/Preset/Permissions.js'
import {EventActionContainer, EventDefault} from '../../Objects/Event/EventDefault.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {TriggerCommand} from '../../Objects/Trigger/TriggerCommand.js'
import {ActionSettingTTS} from '../../Objects/Action/ActionSettingTTS.js'
import {EnumTTSFunctionType} from '../../Enums/TTS.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import {ActionSpeech} from '../../Objects/Action/ActionSpeech.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {ActionChat} from '../../Objects/Action/ActionChat.js'
import {PresetReward} from '../../Objects/Preset/Reward.js'
import {ActionSystem, ActionSystemRewardState} from '../../Objects/Action/ActionSystem.js'
import {EnumTwitchRewardUsable, EnumTwitchRewardVisible} from '../../Enums/Twitch.js'

enum EKeys {
    // region Presets
    PermissionsStreamer = '1 Streamer',
    PermissionsModerators = '2 Moderators',
    PermissionsSubscribers = '3 Subscribers',
    PermissionsVIPs = '4 VIPs',
    PermissionsEveryone = '5 Everyone',

    RewardSpeak = 'Reward Speak',
    RewardSetVoice = 'Reward Set Voice',
    // endregion

    // region Events
    TtsOn = 'Command TTS On',
    TtsOff = 'Command TTS Off',
    TtsSilence = 'Command TTS Silence',
    TtsDie = 'Command TTS Die',
    TtsNick = 'Command TTS Nick',
    TtsClearNick = 'Command TTS Clear Nick',
    TtsMute = 'Command TTS Mute',
    TtsUnmute = 'Command TTS Unmute',
    TtsGender = 'Command TTS Gender',
    TtsSpeak = 'Reward TTS Speak',
    TtsSay = 'Command TTS Say',
    TtsSetVoice = 'Command & Reward TTS Set Voice',
    TtsGetNick = 'Command TTS Get Nick',
    TtsGetVoice = 'Command TTS Get Voice',
    TtsVoices = 'Command TTS Voices',
    DictionarySetWord = 'Command Dictionary Set Word',
    DictionaryGetWord = 'Command Dictionary Get Word',
    DictionaryClearWord = 'Command Dictionary Clear Word'
    // endregion
}

export default class DefaultObjects {
    /**
     * TODO:
     *  1. A list of objects
     *  2. Loop over list
     *  3. Create object form list
     *  4. Fill object with data from template
     *  5. Loop over template properties
     *  6. If template property is a reference, create that reference and return the ID.
     *
     */
    /*
        {
            category: [
                {
                    key: string
                    builder()
                }
            ]
        }
     */

    static readonly MANDATORY_ENTRIES: IDefaultObjectList = {
        permissionPresets: [
            {
                key: EKeys.PermissionsStreamer,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = false
                    instance.subscribers = false
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsModerators,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = false
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsSubscribers,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = false
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsVIPs,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = true
                    instance.everyone = false
                    return await DataBaseHelper.save(instance, key)
                }
            },
            {
                key: EKeys.PermissionsEveryone,
                instance: new PresetPermissions(),
                importer: async (instance: PresetPermissions, key)=>{
                    instance.streamer = true
                    instance.moderators = true
                    instance.subscribers = true
                    instance.VIPs = true
                    instance.everyone = true
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        rewardPresets: [
            // TODO: Add some rewards presets for things in the TTS etc.
            {
                key: EKeys.RewardSpeak,
                instance: new PresetReward(),
                importer: async (instance: PresetReward, key)=>{
                    instance.title = '💬 Speak'
                    instance.cost = 5
                    instance.prompt = 'Your message is read aloud.'
                    instance.background_color = '#AAAAAA'
                    instance.is_user_input_required = true
                    instance.should_redemptions_skip_request_queue = true
                    return await DataBaseHelper.save(instance, key)
                }
            },            {
                key: EKeys.RewardSetVoice,
                instance: new PresetReward(),
                importer: async (instance: PresetReward, key)=>{
                    instance.title = '👄 Set Your Voice'
                    instance.cost = 5
                    instance.prompt = 'Change your speaking voice, see the About section for options.'
                    instance.background_color = '#AAAAAA'
                    instance.is_user_input_required = true
                    instance.should_redemptions_skip_request_queue = true
                    return await DataBaseHelper.save(instance, key)
                }
            }
        ],
        textToSpeechEvents: [
            // region Actions
            {
                key: EKeys.TtsSilence,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('silence', 'stop')
                    trigger.helpText = 'Silence the current speaking TTS entry.'

                    const action = new ActionSettingTTS()
                    action.functionType = EnumTTSFunctionType.StopCurrent

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsDie,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('die', 'ttsdie', 'kill')
                    trigger.helpText = 'Empties the queue and silences what is currently spoken.'

                    const action= new ActionSettingTTS()
                    action.functionType = EnumTTSFunctionType.StopAll

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.requireMinimumWordCount = 1
                    trigger.entries.push('nick', 'setnick', 'name', 'setname')
                    trigger.helpInput.push('usertag', 'nick')
                    trigger.helpText = 'Set the TTS nick name for the tagged user, skip the tag to set your own, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsClearNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('clearnick', 'clearname')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Resets the TTS nick name for the tagged user, skip the tag to reset your own, available for, available for VIPs and subs.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.ClearUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsMute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('mute')
                    trigger.helpInput.push('usertag', 'reason text')
                    trigger.helpText = 'Mutes the tagged user so they will not speak with TTS, persists, reason is optional.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserDisabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has lost their voice.')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsUnmute,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('unmute')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Unmutes the tagged user so they can again speak with TTS.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetTag has regained their voice.')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsGender,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    trigger.entries.push('gender')
                    trigger.helpInput.push('usertag', 'f|m')
                    trigger.helpText = 'Swap the TTS voice gender for the tagged user, skip the tag to swap your own, available for VIPs & subs, optionally specify a gender.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserEnabled
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.TtsSpeak,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerReward()
                    trigger.rewardEntries.push(await DefaultObjects.loadID(new PresetReward(), EKeys.RewardSpeak))
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUsername = '%userLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSay,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('say')
                    trigger.helpInput.push('message')
                    trigger.helpText = 'Speaks a message with TTS without announcing any user.'

                    const action = new ActionSpeech()
                    action.entries.push('%userInput')
                    action.voiceOfUsername = '%userLogin'

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsSetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const triggerReward = new TriggerReward()
                    triggerReward.rewardEntries.push(await DefaultObjects.loadID(new PresetReward(), EKeys.RewardSetVoice))
                    triggerReward.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    const triggerCommand = new TriggerCommand()
                    triggerCommand.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsVIPs)
                    triggerCommand.entries.push('voice', 'setvoice')
                    triggerCommand.helpInput.push('usertag', 'voice text')
                    triggerCommand.helpText = 'Set the TTS voice for the tagged user, skip the tag to set your own.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key,
                        [triggerReward, triggerCommand],
                        [actionTTS, actionSpeech, actionChat]
                    )
                }
            },{
                key: EKeys.TtsGetNick,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getnick')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS nick name for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetUserNick
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsGetVoice,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getvoice')
                    trigger.helpInput.push('usertag')
                    trigger.helpText = 'Get the current TTS voice for the tagged user, skip the tag to get your own, available for everyone.'
                    trigger.userCooldown = 30

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetUserVoice
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%targetOrUserTag now sounds like this.')
                    actionSpeech.voiceOfUsername = '%targetOrUserLogin'
                    const actionChat = new ActionChat()
                    actionChat.entries.push('TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionChat])
                }
            },{
                key: EKeys.TtsVoices,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('tts', 'voices')
                    trigger.helpText = 'Posts information about how to set your voice.'
                    trigger.userCooldown = 60 * 5

                    const action = new ActionChat()
                    action.entries.push('Preview Google TTS voices here, pick a Wavenet or Neural2 voice (standard is banned) and use the name with the "Set Your Voice" reward 👉 https://cloud.google.com/text-to-speech/docs/voices')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [action])
                }
            },{
                key: EKeys.TtsOn,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttson')
                    trigger.helpTitle = 'Text To Speech'
                    trigger.helpText = 'Turn ON global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.Enable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS enabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardState()
                    rewardState.reward_orEvent = await DefaultObjects.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.visible = EnumTwitchRewardVisible.Disable
                    actionSystem.toggleRewardStates.push(rewardState)

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },{
                key: EKeys.TtsOff,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsModerators)
                    trigger.entries.push('ttsoff')
                    trigger.helpTitle = 'Text To Speech'
                    trigger.helpText = 'Turn OFF global TTS for Twitch chat.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.Disable
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('TTS disabled.')
                    const actionSystem = new ActionSystem()
                    const rewardState = new ActionSystemRewardState()
                    rewardState.reward_orEvent = await DefaultObjects.loadID(new EventDefault(), EKeys.RewardSpeak)
                    rewardState.visible = EnumTwitchRewardVisible.Enable
                    actionSystem.toggleRewardStates.push(rewardState)

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech, actionSystem])
                }
            },
            // endregion

            // region Dictionary
            {
                key: EKeys.DictionarySetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('word', 'setword')
                    trigger.helpInput = ['original', 'replacement']
                    trigger.helpText = 'Adds a word to the dictionary, comma separated replacement will randomize, prepend original with + to append or - to remove.'
                    trigger.requireMinimumWordCount = 2

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord is now said as %lastDictionarySubstitute')
                    actionSpeech.skipDictionary = true

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionTTS, actionSpeech])
                }
            },{
                key: EKeys.DictionaryGetWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('getword')
                    trigger.helpText = 'Gets the current value for a dictionary entry, available for everyone.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.GetDictionaryEntry
                    const actionChat = new ActionChat()
                    actionChat.entries.push('Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"')

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionChat])
                }
            },{
                key: EKeys.DictionaryClearWord,
                instance: new EventDefault(),
                importer: async (instance: EventDefault, key)=>{
                    const trigger = new TriggerCommand()
                    trigger.permissions = await DefaultObjects.loadID(new PresetPermissions(), EKeys.PermissionsEveryone)
                    trigger.entries.push('clearword')
                    trigger.requireExactWordCount = 1
                    trigger.helpText = 'Clears a dictionary entry so it is no longer substituted.'

                    const actionTTS = new ActionSettingTTS()
                    actionTTS.functionType = EnumTTSFunctionType.SetDictionaryEntry
                    const actionSpeech = new ActionSpeech()
                    actionSpeech.entries.push('%lastDictionaryWord was cleared from the dictionary')
                    actionSpeech.skipDictionary = true

                    return await DefaultObjects.registerEvent(instance, key, [trigger], [actionSpeech])
                }
            }
            // endregion
        ]
    }
    static readonly BONUS_ENTRIES: IDefaultObjectList = {
        bonus: []
    }

    static async loadID<T>(instance: T&BaseDataObject, key: string): Promise<number> {
        const item = await DataBaseHelper.loadItem(instance, key)
        return item?.id ?? 0
    }
    static async saveSubAndGetID<T>(instance: T&BaseDataObject, key: string, parentId: number = 0): Promise<number> {
        const subKey = this.buildKey(instance, key)
        return await this.saveAndGetID(instance, subKey, parentId)
    }
    static async saveAndGetID<T>(instance: T&BaseDataObject, key: string, parentId: number = 0): Promise<number> {
        await DataBaseHelper.save(instance, key, undefined, parentId)
        const item = await DataBaseHelper.loadItem(instance, key)
        return item?.id ?? 0
    }
    static buildKey<T>(instance: T&BaseDataObject, key: string): string {
        return `${key} ${Utils.camelToTitle(instance.constructor.name, EUtilsTitleReturnOption.SkipFirstWord)}`
    }
    static async registerEvent(
        instance: EventDefault,
        key: string,
        triggers: BaseDataObject[],
        actions: BaseDataObject[]
    ): Promise<boolean> {
        const parentId = await DefaultObjects.saveAndGetID(instance, key)
        if(parentId > 0) {
            for(const trigger of triggers) {
                instance.triggers.push(await DefaultObjects.saveSubAndGetID(trigger, key, parentId))
            }
            const actionContainer = new EventActionContainer()
            for(const action of actions) {
                actionContainer.entries.push(await DefaultObjects.saveSubAndGetID(action, key, parentId))
            }
            instance.actions.push(actionContainer)
        }
        return await DataBaseHelper.save(instance, key)
    }
}

export interface IDefaultObjectList {
    [category: string]: IDefaultObject[]
}

export interface IDefaultObject {
    key: EKeys
    instance: BaseDataObject
    importer: IDefaultObjectImporter<any>
    parentKey?: string
    parentClass?: string
}
export type IDefaultObjectImporter<T extends BaseDataObject> = (item: T, key: string) => Promise<boolean>