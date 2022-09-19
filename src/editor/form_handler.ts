import Utils from '../widget/utils.js'
import SectionHandler from './section_handler.js'
import Data, {AuthData, DBData, GitVersion, LOCAL_STORAGE_AUTH_KEY, MigrationData} from '../modules/data.js'
import {SettingTwitchClient, SettingTwitchTokens} from '../modules/settings.js'
import DB from '../modules/db.js'

type TForm =
    'Register'
    | 'Login'
    | 'DBSetup'
    | 'TwitchClient'
export default class FormHandler {
    // region Values
    private static formElements: Record<TForm, HTMLFormElement|null> = {
        'Register': FormHandler.getFormElement('Register'),
        'Login': FormHandler.getFormElement('Login'),
        'DBSetup': FormHandler.getFormElement('DBSetup'),
        'TwitchClient': FormHandler.getFormElement('TwitchClient')
    }
    private static formSubmits: Record<TForm, any> = {
        'Register': FormHandler.submitRegister,
        'Login': FormHandler.submitLogin,
        'DBSetup': FormHandler.submitDBSetup,
        'TwitchClient': FormHandler.submitTwitchClient
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

        // Twitch client info
        const twitchClient = await DB.loadSettingsDB<SettingTwitchClient>(SettingTwitchClient.name, 'Main')
        if(!twitchClient || Utils.isEmptyObject(twitchClient)) return SectionHandler.show('TwitchClient')

        // Twitch credentials
        const twitchTokens = await DB.loadSettingsDB<SettingTwitchTokens>(SettingTwitchTokens.name, 'Channel')
        console.log(twitchTokens)
        if(!twitchTokens || Utils.isEmptyObject(twitchTokens)) return SectionHandler.show('TwitchLogin')

        // Imports
        // TODO: If settings table is empty, offer up import capability.
        // TODO: It won't be if it has Twitch credentials in it, make it a button?

        // Done, show the site.
        // TODO: Include current database version on page.
        SectionHandler.show('Editor')
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
        const ok = await Data.writeData('db.php', inputData)
        if(ok) {
            const dbOk = await DB.testConnection()
            if(dbOk) FormHandler.setup().then()
            else alert('Could not connect to the database')
        } else alert('Could not store database settings on disk.')
    }
    static async submitTwitchClient(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target, new SettingTwitchClient())
        console.log("Input from the form: ", inputData)
        const ok = await DB.saveSettingDB(inputData, 'Main')
        if(ok) await FormHandler.setup()
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

    private static getFormElement(name: TForm): HTMLFormElement|null
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