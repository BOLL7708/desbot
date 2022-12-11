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
    private static formElements: Record<TForm, HTMLFormElement|undefined> = {
        'Register': SetupFormHandler.getFormElement('Register'),
        'Login': SetupFormHandler.getFormElement('Login'),
        'DBSetup': SetupFormHandler.getFormElement('DBSetup'),
        'TwitchClient': SetupFormHandler.getFormElement('TwitchClient'),
        'TwitchLoginChannel': SetupFormHandler.getFormElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': SetupFormHandler.getFormElement('TwitchLoginChatbot')
    }
    private static formSubmits: Record<TForm, any> = {
        'Register': SetupFormHandler.submitRegister,
        'Login': SetupFormHandler.submitLogin,
        'DBSetup': SetupFormHandler.submitDBSetup,
        'TwitchClient': SetupFormHandler.submitTwitchClient,
        'TwitchLoginChannel': SetupFormHandler.submitTwitchLogin,
        'TwitchLoginChatbot': SetupFormHandler.submitTwitchLogin
    }
    // endregion

    static async init() {
        // Attach form handlers
        for(const [name, form] of Object.entries(SetupFormHandler.formElements) as [TForm, HTMLFormElement|null][]) {
            if(form) form.onsubmit = this.formSubmits[name]
        }
        SetupFormHandler.setup().then()
    }

    static async setup() {
        // Decide what to show first depending on if we have a password stored.
        const authData = await DataUtils.readData<AuthData>('auth.php')

        // No auth data on disk, we need to register a password.
        if(!authData) return SetupSectionHandler.show('Register')

        const localAuth = Utils.getAuth()
        // No password saved in the browser client, we need to log in.
        if(localAuth.length == 0 || !await AuthUtils.checkIfAuthed()) return SetupSectionHandler.show('Login')

        // No database data stored on disk, we need to register that.
        const dbData = await DataUtils.readData<DBData>('db.php')
        if(!dbData) return SetupSectionHandler.show('DBSetup')

        // Database migration
        await SetupFormHandler.migrateDB()

        // Twitch client info
        const twitchClient = await DataBaseHelper.loadSetting(new SettingTwitchClient(), 'Main', true)
        if(!twitchClient || Utils.isEmptyObject(twitchClient)) {
            // Fill form with existing values.
            const form = SetupFormHandler.formElements['TwitchClient']
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
            return SetupSectionHandler.show('TwitchClient')
        }

        // Twitch scopes
        const scopesResponse = await fetch('twitch_scopes.json')
        let scopes = await scopesResponse.json()
        if(Array.isArray(scopes)) scopes = scopes.join(' ')
        // Twitch credentials channel
        const twitchChannelTokens = await DataBaseHelper.loadSetting(new SettingTwitchTokens(), 'Channel', true)
        if(!twitchChannelTokens || Utils.isEmptyObject(twitchChannelTokens) || twitchChannelTokens.scopes !== scopes) {
            return SetupSectionHandler.show('TwitchLoginChannel')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChannelP = document.querySelector('#signedInChannel strong')
            if(signedInChannelP) signedInChannelP.innerHTML += twitchChannelTokens.userLogin
        }

        // Twitch credentials chatbot
        const twitchChatbotTokens = await DataBaseHelper.loadSetting(new SettingTwitchTokens(), 'Chatbot', true)
        if(!twitchChatbotTokens || Utils.isEmptyObject(twitchChatbotTokens) || twitchChatbotTokens.scopes !== scopes) {
            return SetupSectionHandler.show('TwitchLoginChatbot')
        } else {
            // Update value on page, as this restarts after auth this will happen when auth has been completed.
            const signedInChatbotP = document.querySelector('#signedInChatbot strong')
            if(signedInChatbotP) signedInChatbotP.innerHTML += twitchChatbotTokens.userLogin
        }

        // Imports
        let importStatus = await DataBaseHelper.loadSetting(new SettingImportStatus(), 'Legacy', true)
        if(!importStatus || !importStatus.done) {
            await SetupSectionHandler.show('Waiting', 'Waiting...', 'Confirm if you want to do the import or not.')
            const doImport = confirm('It is possible to import legacy settings, do you want do this import? Cancelling will mark it as done.')
            importStatus = new SettingImportStatus()
            importStatus.done = true
            if(doImport) {
                await SetupSectionHandler.show('Loading', 'Importing...', 'This can take several minutes, please wait while all your old settings are being imported.')
                const importResponse = await fetch('import_settings.php')
                const importDictionary = importResponse.ok ? await importResponse.json() as { [key:string]: number } : { 'Nothing to import.': 0 }
                const importArr: string[] = [];
                for(const [str, num] of Object.entries(importDictionary)) {
                    importArr.push(` ${str} - ${num}`)
                }
                alert('Result:\n'+importArr.join('\n'))
            }
            // To avoid asking every time, we mark this as done regardless if it was done or not.
            await DataBaseHelper.saveSetting(importStatus, 'Legacy')
        }

        // Temporary stop for showing the settings browser, before we have a menu.
        // await SettingsHandler.init()
        // return SetupSectionHandler.show('SettingsBrowser')

        // Done, show the site.
        window.location.href = './editor.php'
        /*
        await SetupSectionHandler.show('Editor')
        const classesAndCounts = await DataBaseHelper.loadSettingClasses()
        const settingsCounts = document.querySelector('#settingsCounts') as HTMLParagraphElement
        const ol = document.createElement('ul') as HTMLUListElement
        for(const [group,count] of Object.entries(classesAndCounts)) {
            const li = document.createElement('li') as HTMLLIElement
            li.innerHTML = `${group}: <strong>${count}</strong>`
            ol.appendChild(li)
        }
        settingsCounts.appendChild(ol)
        */
    }

    // region Form Logic
    static async submitRegister(event: SubmitEvent) {
        event.preventDefault()
        const inputData = SetupFormHandler.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else {
            const ok = await DataUtils.writeData('auth.php', inputData)
            if(ok) {
                SetupFormHandler.storeAuth(password)
                SetupFormHandler.setup().then()
            } else {
                alert('Could not store password on disk')
            }
        }
    }
    static async submitLogin(event: SubmitEvent) {
        event.preventDefault()
        const inputData = SetupFormHandler.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else SetupFormHandler.storeAuth(password)
        SetupFormHandler.setup().then()
    }
    static async submitDBSetup(event: SubmitEvent) {
        event.preventDefault()
        const inputData = SetupFormHandler.getFormInputData(event.target, new DBData())
        const ok = await DataUtils.writeData('db.php', inputData)
        if(ok) {
            const dbOk = await DataBaseHelper.testConnection()
            if(dbOk) SetupFormHandler.setup().then()
            else alert('Could not connect to the database')
        } else alert('Could not store database settings on disk.')
    }
    static async submitTwitchClient(event: SubmitEvent) {
        event.preventDefault()
        await SetupSectionHandler.show('Loading', 'Saving...', '')
        const inputData = SetupFormHandler.getFormInputData(event.target, new SettingTwitchClient())
        const ok = await DataBaseHelper.saveSetting(inputData, 'Main')
        if(ok) SetupFormHandler.setup().then()
        else alert('Could not store Twitch Client settings in DataBaseHelper.')
    }
    static async submitTwitchLogin(event: SubmitEvent) {
        event.preventDefault()
        await SetupSectionHandler.show('Loading', 'Authenticating...', 'Waiting for a return from Twitch, reload page to restart.')
        const inputData = SetupFormHandler.getFormInputData(event.target, new StateInput());
        (window as any).ReportTwitchOAuthResult = async (userId: string)=>{
            if(userId.length == 0) {
                const reset = confirm('Could not retrieve Twitch tokens, do you want to reset the Twitch Client settings?')
                if(reset) await DataBaseHelper.deleteSetting(new SettingTwitchClient(), 'Main')
            }
            await SetupFormHandler.setup()
        }
        window.open(`twitch_auth.php?state=${inputData.state}`, 'StreamingWidgetTwitchAuthAuxiliaryWindow')
    }
    // endregion

    // region Helpers
    static getFormInputData<T>(target: EventTarget|null, output: T&Object): T {
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

    private static getFormElement(name: TForm): HTMLFormElement|undefined
    {
        const element = Utils.getElement<HTMLFormElement>(`#form${name}`)
        console.log(`Get ${name} FORM element: ${element?.id}`)
        return element
    }

    private static storeAuth(password: string) {
        console.log(`Storing auth: ${password}`)
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder(), password)
    }

    /**
     * Used to upgrade the database to the latest version.
     * Will pop result and error alerts.
     * @private
     */
    private static async migrateDB() {
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
            await SetupSectionHandler.show('Waiting', 'Database Migration...', 'Decide if you want to upgrade to the latest version.')
            const doMigration = confirm(`Do you want to migrate the database from version ${databaseVersion} to version ${highestPossibleVersion}?`)
            if(doMigration) {
                await SetupSectionHandler.show('Loading', 'Database Migration...', 'Running database migration(s).')
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