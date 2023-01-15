import Utils from '../../Classes/Utils.js'
import SetupSectionHandler from './SetupSectionHandler.js'
import DataUtils, {
    AuthData,
    DBData,
    GitVersion,
    LOCAL_STORAGE_AUTH_KEY,
    MigrationData,
    MigrationVersion
} from '../../Classes/DataUtils.js'
import {SettingImportStatus, SettingTwitchClient, SettingTwitchTokens} from '../../Classes/SettingObjects.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import AuthUtils from '../../Classes/AuthUtils.js'

type TForm =
    'Register'
    | 'Login'
    | 'DBSetup'
    | 'TwitchClient'
    | 'TwitchLoginChannel'
    | 'TwitchLoginChatbot'

export default class SetupFormHandler {
    // region Values
    private _formElements: Record<TForm, HTMLFormElement|undefined> = {
        'Register': this.getFormElement('Register'),
        'Login': this.getFormElement('Login'),
        'DBSetup': this.getFormElement('DBSetup'),
        'TwitchClient': this.getFormElement('TwitchClient'),
        'TwitchLoginChannel': this.getFormElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': this.getFormElement('TwitchLoginChatbot')
    }
    private _formSubmits: Record<TForm, any> = {
        'Register': this.submitRegister.bind(this),
        'Login': this.submitLogin.bind(this),
        'DBSetup': this.submitDBSetup.bind(this),
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
        const authData = await DataUtils.readData<AuthData>('auth.php')

        // No auth data on disk, we need to register a password.
        if(!authData) return this._sections.show('Register')

        const localAuth = Utils.getAuth()
        // No password saved in the browser client, we need to log in.
        if(localAuth.length == 0 || !await AuthUtils.checkIfAuthed()) return this._sections.show('Login')

        // No database data stored on disk, we need to register that.
        const dbData = await DataUtils.readData<DBData>('db.php')
        if(!dbData) return this._sections.show('DBSetup')

        // Database migration
        await this.migrateDB()

        // Twitch client info
        const twitchClient = await DataBaseHelper.load(new SettingTwitchClient(), 'Main', true)
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
                const href = window.location.href.split('?').shift()
                redirectUri.value = Utils.ensureValue<SettingTwitchClient>(
                    twitchClient ?? []
                )?.redirectUri ?? href + 'twitch_auth.php'
            }

            // Show form
            return this._sections.show('TwitchClient')
        }

        // Twitch scopes
        const scopesResponse = await fetch('twitch_scopes.json')
        let scopes = await scopesResponse.json()
        if(Array.isArray(scopes)) scopes = scopes.join(' ')
        // Twitch credentials channel
        const twitchChannelTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel', true)
        if(!twitchChannelTokens || Utils.isEmptyObject(twitchChannelTokens) || twitchChannelTokens.scopes !== scopes) {
            console.log('We need to login Channel Twitch account', twitchChannelTokens)
            return this._sections.show('TwitchLoginChannel')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChannelP = document.querySelector('#signedInChannel strong')
            if(signedInChannelP) signedInChannelP.innerHTML += twitchChannelTokens.userLogin
        }

        // Twitch credentials chatbot
        const twitchChatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot', true)
        if(!twitchChatbotTokens || Utils.isEmptyObject(twitchChatbotTokens) || twitchChatbotTokens.scopes !== scopes) {
            console.log('We need to login Chatbot Twitch account', twitchChatbotTokens)
            return this._sections.show('TwitchLoginChatbot')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChatbotP = document.querySelector('#signedInChatbot strong')
            if(signedInChatbotP) signedInChatbotP.innerHTML += twitchChatbotTokens.userLogin
        }

        // Imports
        let importStatus = await DataBaseHelper.load(new SettingImportStatus(), 'Legacy', true)
        if(!importStatus || !importStatus.done) {
            await this._sections.show('Waiting', 'Waiting...', 'Confirm if you want to do the import or not.')
            const doImport = confirm('It is possible to import legacy settings from the _settings folder, do you want do this import? Cancelling will mark it as done.')
            importStatus = new SettingImportStatus()
            importStatus.done = true
            if(doImport) {
                await this._sections.show('Loading', 'Importing...', 'This can take several minutes, please wait while all your old settings are being imported.')
                const importResponse = await fetch('import_settings.php')
                const importDictionary = importResponse.ok ? await importResponse.json() as { [key:string]: number } : { 'Failed to import.': -1 }
                const importArr: string[] = [];
                for(const [str, num] of Object.entries(importDictionary)) {
                    importArr.push(` ${str} => ${num}`)
                }
                if(importArr.length == 0) alert('Nothing to import, either the _settings folder does not exist, or is empty.')
                else alert('Result:\n'+importArr.join('\n'))
            }
            // To avoid asking every time, we mark this as done regardless if it was done or not.
            await DataBaseHelper.save(importStatus, 'Legacy')
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
            const ok = await DataUtils.writeData('auth.php', inputData)
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
    async submitDBSetup(event: SubmitEvent) {
        event.preventDefault()
        const inputData = this.getFormInputData(event.target, new DBData())
        const ok = await DataUtils.writeData('db.php', inputData)
        if(ok) {
            const dbOk = await DataBaseHelper.testConnection()
            if(dbOk) this.setup().then()
            else alert('Could not connect to the database')
        } else alert('Could not store database settings on disk.')
    }
    async submitTwitchClient(event: SubmitEvent) {
        event.preventDefault()
        await this._sections.show('Loading', 'Saving...', '')
        const inputData = this.getFormInputData(event.target, new SettingTwitchClient())
        const ok = await DataBaseHelper.save(inputData, 'Main')
        if(ok) this.setup().then()
        else alert('Could not store Twitch Client settings in DataBaseHelper.')
    }
    async submitTwitchLogin(event: SubmitEvent) {
        event.preventDefault()
        await this._sections.show('Loading', 'Authenticating...', 'Waiting for a return from Twitch, reload page to restart.')
        const inputData = this.getFormInputData(event.target, new StateInput());
        (window as any).ReportTwitchOAuthResult = async (userId: string)=>{
            if(userId.length == 0) {
                const reset = confirm('Could not retrieve Twitch tokens, do you want to reset the Twitch Client settings?')
                if(reset) await DataBaseHelper.delete(new SettingTwitchClient(), 'Main')
            }
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

    /**
     * Used to upgrade the database to the latest version.
     * Will pop result and error alerts.
     * @private
     */
    private async migrateDB() {
        // Get highest possible version
        const versionResponse = await fetch(
            'migrate.php',
            { headers: { Authorization: Utils.getAuth() } }
        )
        const migrationVersion = await versionResponse.json() as MigrationVersion
        const highestPossibleVersion = migrationVersion.version

        // Get previous widget version stored on disk
        let versionData = (await DataUtils.readData<GitVersion>('version.json') ?? {current: 0}) as GitVersion
        let databaseVersion = versionData?.current ?? 0

        // Migrate database if accepted.
        if(databaseVersion !== highestPossibleVersion && databaseVersion < highestPossibleVersion) {
            await this._sections.show('Waiting', 'Database Migration...', 'Decide if you want to upgrade to the latest version.')
            const doMigration = confirm(`Do you want to migrate the database from version ${databaseVersion} to version ${highestPossibleVersion}?`)
            if(doMigration) {
                await this._sections.show('Loading', 'Database Migration...', 'Running database migration(s).')
                const migrateResponse = await fetch(
                    `migrate.php?from=${databaseVersion}&to=${highestPossibleVersion}`,
                    { headers: { Authorization: Utils.getAuth() } }
                )
                const migrateResult = await migrateResponse.json() as MigrationData
                alert(`Database migrations done: ${migrateResult.count}, reached version: ${migrateResult.id}.`)
                versionData = {current: migrateResult.id}
                const ok = await DataUtils.writeData('version.json', versionData).then()
                if(!ok) alert('Could not store new database version on disk.')
            }
        }
        // Update page with values.
        const dbVersionTag = document.querySelector('#dbversion strong')
        if(dbVersionTag) dbVersionTag.innerHTML = versionData.current.toString()
        const migrationVersionTag = document.querySelector('#dbMigration strong')
        if(migrationVersionTag) migrationVersionTag.innerHTML = highestPossibleVersion.toString()
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