import Utils from '../widget/utils.js'
import SectionHandler from './section_handler.js'
import Data, {AuthData, DBData, GitVersion, LOCAL_STORAGE_AUTH_KEY, MigrationData} from '../modules/data.js'
import {SettingImportStatus, SettingTwitchClient, SettingTwitchTokens} from '../modules/settings.js'
import DB from '../modules/db.js'
import SettingsHandler from './settings_handler.js'

type TForm =
    'Register'
    | 'Login'
    | 'DBSetup'
    | 'Twitch'

export default class FormHandler {
    // region Values
    private static formElements: Record<TForm, HTMLFormElement|undefined> = {
        'Register': FormHandler.getFormElement('Register'),
        'Login': FormHandler.getFormElement('Login'),
        'DBSetup': FormHandler.getFormElement('DBSetup'),
        'Twitch': FormHandler.getFormElement('Twitch')
    }
    private static formSubmits: Record<TForm, any> = {
        'Register': FormHandler.submitRegister,
        'Login': FormHandler.submitLogin,
        'DBSetup': FormHandler.submitDBSetup,
        'Twitch': FormHandler.submitTwitchClient
    }
    // endregion

    static async init() {
        // Attach form handlers
        for(const [name, form] of Object.entries(FormHandler.formElements) as [TForm, HTMLFormElement|null][]) {
            if(form) form.onsubmit = this.formSubmits[name]
        }
        FormHandler.setup().then()
    }

    static async setup() {
        // Decide what to show first depending on if we have a password stored.
        const authData = await Data.readData<AuthData>('auth.php')

        // No auth data on disk, we need to register a password.
        if(!authData) return SectionHandler.show('Register')

        // No password saved in the browser client, we need to log in.
        if(Utils.getAuth().length == 0) return SectionHandler.show('Login')

        // No database data stored on disk, we need to register that.
        const dbData = await Data.readData<DBData>('db.php')
        if(!dbData) return SectionHandler.show('DBSetup')

        // Database migration
        SectionHandler.show('Loading')
        await FormHandler.migrateDB()

        // Twitch credentials & client info
        const twitchTokens = await DB.loadSetting(new SettingTwitchTokens(), 'Channel', true)
        const twitchClient = await DB.loadSetting(new SettingTwitchClient(), 'Main', true)
        if(!twitchTokens || Utils.isEmptyObject(twitchTokens) || !twitchClient || Utils.isEmptyObject(twitchClient)) {
            // Fill form with existing values.
            const form = FormHandler.formElements['Twitch']
            if(twitchClient && !Utils.isEmptyObject(twitchClient)) {
                const clientId = form?.querySelector<HTMLInputElement>('[name="clientId"]')
                if(clientId) clientId.value = Utils.ensureValue<SettingTwitchClient>(twitchClient)?.clientId ?? ''
                const clientSecret = form?.querySelector<HTMLInputElement>('[name="clientSecret"]')
                if(clientSecret) clientSecret.value = Utils.ensureValue<SettingTwitchClient>(twitchClient)?.clientSecret ?? ''
            }
            const redirectUri = form?.querySelector<HTMLInputElement>('[name="redirectUri"]')
            if(redirectUri) redirectUri.value = Utils.ensureValue<SettingTwitchClient>(twitchClient ?? [])?.redirectUri ?? window.location.href+'twitch_auth.php'
            // Show form
            return SectionHandler.show('Twitch')
        }

        // Imports
        let importStatus = await DB.loadSetting(new SettingImportStatus(), 'Legacy', true)
        if(!importStatus || !importStatus.done) {
            SectionHandler.show('Waiting')
            const doImport = confirm('It is possible to import legacy settings, do you want do the import?')
            importStatus = new SettingImportStatus()
            importStatus.done = true
            if(doImport) {
                SectionHandler.show('Loading')
                const importResponse = await fetch('import_settings.php')
                const importDictionary = importResponse.ok ? await importResponse.json() as { [key:string]: number } : { 'Nothing to import.': 0 }
                const importArr: string[] = [];
                for(const [str, num] of Object.entries(importDictionary)) {
                    importArr.push(` ${str} - ${num}`)
                }
                alert('Result:\n'+importArr.join('\n'))
            }
            // To avoid asking every time, we mark this as done regardless if it was done or not.
            await DB.saveSettingDB(importStatus, 'Legacy')
        }

        // Temporary stop for showing the settings browser, before we have a menu.
        // TODO: Include current database version on page.
        await SettingsHandler.init()
        return SectionHandler.show('SettingsBrowser')

        // Done, show the site.
        // SectionHandler.show('Editor')
    }

    // region Form Logic
    static async submitRegister(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else {
            const ok = await Data.writeData('auth.php', inputData)
            if(ok) {
                FormHandler.storeAuth(password)
                FormHandler.setup().then()
            } else {
                alert('Could not store password on disk')
            }
        }
    }
    static async submitLogin(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target, new PasswordInput())
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else FormHandler.storeAuth(password)
        FormHandler.setup().then()
    }
    static async submitDBSetup(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target, new DBData())
        const ok = await Data.writeData('db_settings.php', inputData)
        if(ok) {
            const dbOk = await DB.testConnection()
            if(dbOk) FormHandler.setup().then()
            else alert('Could not connect to the database')
        } else alert('Could not store database settings on disk.')
    }
    static async submitTwitchClient(event: SubmitEvent) {
        event.preventDefault()
        SectionHandler.show('Waiting')
        const inputData = FormHandler.getFormInputData(event.target, new SettingTwitchClient())
        const ok = await DB.saveSettingDB(inputData, 'Main')
        if(ok) {
            (window as any).ReportTwitchOAuthResult = async (userId: string)=>{
                if(userId.length == 0) alert('Could not retrieve Twitch tokens.')
                await FormHandler.setup()
            }
            window.open('twitch_auth.php', 'StreamingWidgetTwitchAuthAuxiliaryWindow')
        }
        else alert('Could not store Twitch Client settings in DB.')
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
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, password)
    }

    /**
     * Used to upgrade the database to the latest version.
     * Will pop result and error alerts.
     * @private
     */
    private static async migrateDB() {
        // Get current widget version from the git master branch
        const gitResponse = await fetch('git.php');
        const gitJson = await gitResponse.json() as GitVersion|undefined
        const widgetVersion = gitJson?.count ?? -1;
        // Get previous widget version stored on disk
        const versionData = await Data.readData<GitVersion>('version.json')
        let databaseVersion = 0
        if(versionData && typeof versionData !== 'string') {
            databaseVersion = (versionData as GitVersion|undefined)?.count ?? 0
        }
        if(databaseVersion < widgetVersion) {
            const doMigration = confirm(`Do you want to migrate the database from version ${databaseVersion} to version ${widgetVersion}?`)
            if(!doMigration) return

            const migrateResponse = await fetch(
                `migrate.php?from=${databaseVersion}&to=${widgetVersion}`,
                { headers: { Authorization: Utils.getAuth() } }
            )
            const migrateResult = await migrateResponse.json() as MigrationData
            alert(`Database migrations done: ${migrateResult.count}, reached version: ${migrateResult.id}.`)
            const newVersion: GitVersion = {count: migrateResult.id}
            const ok = await Data.writeData('version.json', newVersion).then()
            if(!ok) alert('Could not store new database version on disk.')
        }
    }
    // endregion
}

// region Interfaces

// We get these from the forms and also save it to a file on disk.
class PasswordInput {
    password: string = ''
}
// endregion