import ActionSettingTTS from '../../../Shared/Objects/Data/Action/ActionSettingTTS.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import StatesSingleton from '../../../Shared/Singletons/StatesSingleton.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import {OptionTTSFunctionType} from '../../../Shared/Objects/Options/OptionTTS.js'
import {EEventSource} from '../../../Shared/Bot/Enums.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import Color from '../../../Shared/Constants/ColorConstants.js'
import SettingDictionaryEntry from '../../../Shared/Objects/Data/Setting/SettingDictionary.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import SettingUser, {SettingUserMute, SettingUserName} from '../../../Shared/Objects/Data/Setting/SettingUser.js'

export default class ActionSettingTTSRunner extends ActionSettingTTS {
    build(key: string): IActionCallback {
        return {
            awaitCall: true,
            description: 'Callback that executes a TTS function',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionSettingTTS>(this)
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const input = await TextHelper.replaceTagsInText(clone.inputOverride ?? user.input, user)
                const inputLowerCase = input.toLowerCase()
                const targetId = parseInt(await TextHelper.replaceTagsInText('%targetId', user))
                const targetLogin = await TextHelper.replaceTagsInText('%targetLogin', user)
                const targetOrUserId = parseInt(await TextHelper.replaceTagsInText('%targetOrUserId', user))
                const targetOrUserLogin = await TextHelper.replaceTagsInText('%targetOrUserLogin', user)
                const userInputHead = await TextHelper.replaceTagsInText('%userInputHead', user)
                const userInputRest = await TextHelper.replaceTagsInText('%userInputRest', user)
                const userInputNoTags = await TextHelper.replaceTagsInText('%userInputNoTags', user)
                const canSetThingsForOthers = user.isBroadcaster || user.isModerator
                const targetUser = await DataBaseHelper.loadOrEmpty(new SettingUser(), targetOrUserId.toString())
                switch (clone.functionType) {
                    case OptionTTSFunctionType.Enable:
                        states.ttsForAll = true
                        break
                    case OptionTTSFunctionType.Disable:
                        states.ttsForAll = false
                        break
                    case OptionTTSFunctionType.StopCurrent:
                        modules.tts.stopSpeaking()
                        break
                    case OptionTTSFunctionType.StopAll:
                        modules.tts.stopSpeaking(true)
                        break
                    case OptionTTSFunctionType.SetUserEnabled: {
                        if (!targetId) break
                        const setting = new SettingUserMute()
                        setting.active = false
                        setting.reason = userInputRest
                        setting.moderatorUserId = user.id
                        setting.datetime = Utils.getISOTimestamp()
                        targetUser.mute = setting
                        await DataBaseHelper.save(targetUser, targetId.toString())
                        break
                    }
                    case OptionTTSFunctionType.SetUserDisabled: {
                        if (!targetId) break
                        const setting = new SettingUserMute()
                        setting.active = true
                        setting.reason = userInputRest
                        setting.moderatorUserId = user.id
                        setting.datetime = Utils.getISOTimestamp()
                        targetUser.mute = setting
                        await DataBaseHelper.save(targetUser, targetId.toString())
                        break
                    }
                    case OptionTTSFunctionType.SetUserNick: {
                        let id = targetOrUserId // We can change nick for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isSettingNickOfOther = user.id !== id
                        const newNick = userInputNoTags

                        // Cancel if the user does not actually exist on Twitch
                        const userData = await TwitchHelixHelper.getUserById(id)
                        if (!userData) return Utils.log(`TTS Nick: User with ID:${id} does not exist.`, Color.Red)

                        if (
                            id && newNick.length && (
                                canSetThingsForOthers || (
                                    isSettingNickOfOther == canSetThingsForOthers
                                )
                            )
                        ) {
                            // We rename the user
                            states.textTagCache.lastTTSSetNickLogin = userData.display_name
                            states.textTagCache.lastTTSSetNickSubstitute = newNick
                            const setting = new SettingUserName()
                            setting.shortName = newNick
                            setting.editorUserId = id
                            setting.datetime = Utils.getISOTimestamp()
                            targetUser.name = setting
                            await DataBaseHelper.save(targetUser, id.toString())
                        } else {
                            // We do nothing
                            states.textTagCache.lastTTSSetNickLogin = ''
                            states.textTagCache.lastTTSSetNickSubstitute = ''
                        }
                        break
                    }
                    case OptionTTSFunctionType.GetUserNick: {
                        const userData = await TwitchHelixHelper.getUserById(targetOrUserId)
                        if (userData && userData.login.length) {
                            const currentName = targetUser.name
                            if (currentName.shortName.trim().length > 0) {
                                states.textTagCache.lastTTSSetNickLogin = userData.display_name
                                states.textTagCache.lastTTSSetNickSubstitute = currentName.shortName
                            } else {
                                states.textTagCache.lastTTSSetNickLogin = userData.display_name
                                states.textTagCache.lastTTSSetNickSubstitute = ''
                            }
                        }
                        break
                    }
                    case OptionTTSFunctionType.ClearUserNick: {
                        let id = targetOrUserId // We can change nick for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isClearingNickOfOther = user.id !== id
                        const userData = await TwitchHelixHelper.getUserById(id)
                        if (
                            userData && (canSetThingsForOthers || (isClearingNickOfOther == canSetThingsForOthers))
                        ) {
                            // We clear the custom nick for the user, setting it to a clean one.
                            const cleanName = TextHelper.cleanName(userData.login)
                            states.textTagCache.lastTTSSetNickLogin = userData.display_name
                            states.textTagCache.lastTTSSetNickSubstitute = cleanName
                            const setting = new SettingUserName()
                            setting.shortName = cleanName
                            setting.editorUserId = user.id
                            setting.datetime = Utils.getISOTimestamp()
                            targetUser.name = setting
                            await DataBaseHelper.save(targetUser, id.toString())
                        }
                        break
                    }
                    case OptionTTSFunctionType.SetUserVoice: {
                        let id = targetOrUserId // We can change voice for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isSettingVoiceOfOther = user.id !== id
                        if (
                            id && userInputNoTags.length
                            && (canSetThingsForOthers || (isSettingVoiceOfOther == canSetThingsForOthers))
                        ) {
                            await modules.tts.setVoiceForUser(id, userInputNoTags)
                        }
                        break
                    }
                    case OptionTTSFunctionType.SetDictionaryEntry: {
                        let word = userInputHead.trim().toLowerCase()
                        const firstChar = word[0] ?? ''
                        word = ['+', '-'].includes(firstChar) ? word.substring(1) : word
                        const substitute = TextHelper.cleanSetting(userInputRest).toLowerCase()

                        let entry = await DataBaseHelper.load(new SettingDictionaryEntry(), word)
                        if (!entry) {
                            entry = new SettingDictionaryEntry()
                            entry.substitute = ''
                        }
                        entry.editorUserId = user.id
                        entry.datetime = Utils.getISOTimestamp()
                        const entries = entry.substitute.split(',')
                        // entries.splice(entries.indexOf(word), 1) // TODO: Not sure why this existed... it broke anyway and disabled the + option.
                        switch (firstChar) {
                            case '+':
                                entries.push(substitute)
                                entry.substitute = entries.join(',')
                                break
                            case '-':
                                entries.splice(entries.indexOf(substitute), 1)
                                entry.substitute = entries.join(',')
                                break
                            default:
                                entry.substitute = substitute
                        }
                        states.textTagCache.lastDictionaryWord = word
                        states.textTagCache.lastDictionarySubstitute = entry.substitute
                        // Set substitute for word
                        if (word.length && substitute.length) {
                            await DataBaseHelper.save(entry, word)
                        }
                        // Clearing a word by setting it to itself
                        else if (word.length) {
                            entry.substitute = word
                            states.textTagCache.lastDictionarySubstitute = word
                            await DataBaseHelper.save(entry, word)
                        }
                        const fullDictionaryItems = await DataBaseHelper.loadAll(new SettingDictionaryEntry()) ?? {}
                        const fullDictionary = DataUtils.getKeyDataDictionary(fullDictionaryItems)

                        Object.fromEntries(
                            Object.values(fullDictionaryItems).map(
                                item => [item.key, item.filledData]
                            ).filter(pair => !!pair[1])
                        )
                        if (fullDictionary) {
                            modules.tts.setDictionary(fullDictionary)
                        } else {
                            Utils.log('TTS Dictionary: Could not load full dictionary to update TTS.', Color.DarkRed)
                        }
                        break
                    }
                    case OptionTTSFunctionType.GetDictionaryEntry: {
                        const word = userInputHead.trim().toLowerCase()
                        const entry = await DataBaseHelper.load(new SettingDictionaryEntry(), word)
                        if (entry) {
                            states.textTagCache.lastDictionaryWord = word
                            states.textTagCache.lastDictionarySubstitute = entry.substitute
                        } else {
                            states.textTagCache.lastDictionaryWord = word
                            states.textTagCache.lastDictionarySubstitute = ''
                        }
                        break
                    }
                    case OptionTTSFunctionType.SetUserGender: {
                        let id = targetOrUserId // We can change gender for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        let gender = ''
                        // Use input for a specific gender
                        if (inputLowerCase.includes('f')) gender = 'female'
                        else if (inputLowerCase.includes('m')) gender = 'male'
                        // If missing, flip current or fall back to random.
                        if (gender.length == 0) {
                            if (targetUser.voice.gender.length > 0) gender = targetUser.voice.gender.toLowerCase() == 'male' ? 'female' : 'male'
                            else gender = Utils.randomFromArray(['male', 'female'])
                        }
                        modules.tts.setVoiceForUser(id, gender).then() // This will save the voice setting with the chosen gender.
                        break
                    }
                }
            }
        }
    }
}