import Utils from '../../Classes/Utils.js'
import SetupSectionHandler from './SetupSectionHandler.js'
import DataFileUtils, {
    AuthData,
    GitVersion,
    LOCAL_STORAGE_AUTH_KEY,
    MigrationData,
    MigrationVersion
} from '../../Classes/DataFileUtils.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import AuthUtils from '../../Classes/AuthUtils.js'
import {SettingTwitchClient, SettingTwitchTokens} from '../../Objects/Setting/SettingTwitch.js'

type TForm =
    'Register'
    | 'Login'
    | 'TwitchClient'
    | 'TwitchLoginChannel'
    | 'TwitchLoginChatbot'

export default class SetupFormHandler {
    // region Values
    private _formElements: Record<TForm, HTMLFormElement|undefined> = {
        'Register': this.getFormElement('Register'),
        'Login': this.getFormElement('Login'),
        'TwitchClient': this.getFormElement('TwitchClient'),
        'TwitchLoginChannel': this.getFormElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': this.getFormElement('TwitchLoginChatbot')
    }
    private _formSubmits: Record<TForm, any> = {
        'Register': this.submitRegister.bind(this),
        'Login': this.submitLogin.bind(this),
        'TwitchClient': this.submitTwitchClient.bind(this),
        'TwitchLoginChannel': this.submitTwitchLogin.bind(this),
        'TwitchLoginChatbot': this.submitTwitchLogin.bind(this)
    }
    // endregion

    private _sections = new SetupSectionHandler()
    constructor() {
        // Attach form handlers
        for(const [name, form] of Object.entries(this._formElements) as [TForm, HTMLFormElement|null][]) {
            if(form) form.onsubmit = this._formSubmits[name]
        }
        this.setup().then()
    }

    async setup() {
        // Decide what to show first depending on if we have a password stored.
        const authData = await DataFileUtils.readData<AuthData>('auth.php')

        // No auth data on disk, we need to register a password.
        if(!authData) return this._sections.show('Register')

        const localAuth = Utils.getAuth()
        // No password saved in the browser client, we need to log in.
        if(localAuth.length == 0 || !await AuthUtils.checkIfAuthed()) return this._sections.show('Login')

        // No database data stored on disk, we need to register that.
        // const dbData = await DataFileUtils.readData<DBData>('db.php')
        // if(!dbData) return this._sections.show('DBSetup')

        // Database migration
        // await this.migrateDB() // TODO: Look into doing this automatically when running the future Node solution.

        // Twitch client info
        const twitchClient = await DataBaseHelper.load(new SettingTwitchClient(), 'Main', undefined, true)
        if(!twitchClient || Utils.isEmptyObject(twitchClient)) {
            // Fill form with existing values.
            const form = this._formElements['TwitchClient']
            if (twitchClient && !Utils.isEmptyObject(twitchClient)) {
                const clientId = form?.querySelector<HTMLInputElement>('[name="clientId"]')
                if (clientId) clientId.value = Utils.ensureValue<SettingTwitchClient>(twitchClient)?.clientId ?? ''
                const clientSecret = form?.querySelector<HTMLInputElement>('[name="clientSecret"]')
                if (clientSecret) clientSecret.value = Utils.ensureValue<SettingTwitchClient>(twitchClient)?.clientSecret ?? ''
            }
            const redirectUri = form?.querySelector<HTMLInputElement>('[name="redirectUri"]')
            if (redirectUri) {
                const rx = /\/$|\/[a-zA-Z]+?\.php\??\S*$/s // Will remove a trailing slash or a php file with optional query string.
                const href = window.location.href.replace(rx, '')
                redirectUri.value = Utils.ensureValue<SettingTwitchClient>(
                    twitchClient ?? []
                )?.redirectUri ?? href + '/twitch_auth.php'
            }

            // Show form
            return this._sections.show('TwitchClient')
        }

        // Twitch scopes
        const scopesResponse = await fetch('_twitch_scopes.json')
        let scopes = await scopesResponse.json()
        if(Array.isArray(scopes)) scopes = scopes.join(' ')
        // Twitch credentials channel
        const twitchChannelTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel', undefined, true)
        if(!twitchChannelTokens || Utils.isEmptyObject(twitchChannelTokens) || twitchChannelTokens.scopes !== scopes) {
            console.log('We need to login Channel Twitch account', twitchChannelTokens)
            return this._sections.show('TwitchLoginChannel')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChannelP = document.querySelector('#signedInChannel strong')
            if(signedInChannelP) signedInChannelP.innerHTML += twitchChannelTokens.userLogin
        }

        // Twitch credentials chatbot
        const twitchChatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot', undefined, true)
        if(!twitchChatbotTokens || Utils.isEmptyObject(twitchChatbotTokens) || twitchChatbotTokens.scopes !== scopes) {
            console.log('We need to login Chatbot Twitch account', twitchChatbotTokens)
            return this._sections.show('TwitchLoginChatbot')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChatbotP = document.querySelector('#signedInChatbot strong')
            if(signedInChatbotP) signedInChatbotP.innerHTML += twitchChatbotTokens.userLogin
        }

        // Done, show the dashboard.
        window.location.href = 'dashboard.php'
    }

    // region Form Logic
    async submitRegister(event: SubmitEvent) {
        event.preventDefault()
        const inputData = this.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else {
            const ok = await DataFileUtils.writeData('auth.php', inputData)
            if(ok) {
                this.storeAuth(password)
                this.setup().then()
            } else {
                alert('Could not store password on disk')
            }
        }
    }
    async submitLogin(event: SubmitEvent) {
        event.preventDefault()
        const inputData = this.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else this.storeAuth(password)
        this.setup().then()
    }
    async submitTwitchClient(event: SubmitEvent) {
        event.preventDefault()
        await this._sections.show('Loading', 'Saving...', '')
        const inputData = this.getFormInputData(event.target, new SettingTwitchClient())
        const ok = await DataBaseHelper.save(inputData, 'Main')
        if(ok) this.setup().then()
        else alert('Could not store Twitch Client entry in DataBaseHelper.')
    }
    async submitTwitchLogin(event: SubmitEvent) {
        event.preventDefault()
        await this._sections.show('Loading', 'Authenticating...', 'Waiting for a return from Twitch, reload page to restart.')
        const inputData = this.getFormInputData(event.target, new StateInput());
        window.onmessage = async(event)=>{
            const userId = event.data
            if(userId.length == 0) {
                const reset = confirm('Could not retrieve Twitch tokens, do you want to reset the Twitch Client settings?')
                if(reset) await DataBaseHelper.delete(new SettingTwitchClient(), 'Main')
            }
            window.onmessage = null
            await this.setup()
        }
        window.open(`twitch_auth.php?state=${inputData.state}`, 'StreamingWidgetTwitchAuthAuxiliaryWindow')
    }
    // endregion

    // region Helpers
    getFormInputData<T>(target: EventTarget|null, output: T&Object): T {
        if(target) {
            for(const input of Object.values(target) as HTMLInputElement[]) {
                const key = input.name ?? input.id
                if(key && output.hasOwnProperty(key)) {
                    (output as any)[key] = input.value
                }
            }
        }
        return output
    }

    private getFormElement(name: TForm): HTMLFormElement|undefined
    {
        const element = Utils.getElement<HTMLFormElement>(`#form${name}`)
        console.log(`Get ${name} FORM element: ${element?.id}`)
        return element
    }

    private storeAuth(password: string) {
        console.log(`Storing auth: ${password}`)
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder(), password)
    }
    // endregion
}

// region Interfaces

// We get these from the forms, but they are not saved.
class PasswordInput {
    password: string = ''
}
class StateInput {
    state: string = ''
}
// endregion