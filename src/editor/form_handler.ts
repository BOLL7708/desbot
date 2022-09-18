import Utils from '../widget/utils.js'
import SectionHandler from './section_handler.js'
import Data, {AuthData, DBData, GitVersion, LOCAL_STORAGE_AUTH_KEY, MigrationData} from '../modules/data.js'
import DB from '../modules/db.js'

type TForm =
    'Register'
    | 'Login'
    | 'DBSetup'
export default class FormHandler {
    // region Values
    private static formElements: Record<TForm, HTMLFormElement|null> = {
        'Register': FormHandler.getFormElement('Register'),
        'Login': FormHandler.getFormElement('Login'),
        'DBSetup': FormHandler.getFormElement('DBSetup')
    }
    private static formSubmits: Record<TForm, any> = {
        'Register': FormHandler.submitRegister,
        'Login': FormHandler.submitLogin,
        'DBSetup': FormHandler.submitDBSetup
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

        // Twitch credentials
        // TODO: Add section for sign in into twitch.

        // Imports
        // TODO: If settings table is empty, offer up import capability.

        // Done, show the site.
        SectionHandler.show('Editor')
    }

    // region Form Logic
    static async submitRegister(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target)
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else {
            const ok = await Data.writeData('auth.php', {'password': password})
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
        const inputData = FormHandler.getFormInputData(event.target)
        const password = inputData.password ?? ''
        if(password.length == 0) alert('Password field is empty.')
        else FormHandler.storeAuth(password)
        FormHandler.setup().then()
    }
    static async submitDBSetup(event: SubmitEvent) {
        event.preventDefault()
        const inputData = FormHandler.getFormInputData(event.target)
        const ok = await Data.writeData('db.php', inputData)
        if(ok) {
            const dbOk = await DB.testConnection()
            if(dbOk) FormHandler.setup().then()
            else alert('Could not connect to the database')
        } else alert('Could not store database settings on disk.')
    }
    // endregion

    // region Helpers
    static getFormInputData(target: EventTarget|null): IInputValues {
        const result: IInputValues = {}
        if(target) {
            for(const input of Object.values(target) as HTMLInputElement[]) {
                const key = input.name ?? input.id
                if(key) result[key] = input.value
            }
        }
        return result
    }

    private static getFormElement(name: TForm): HTMLFormElement|null
    {
        return Utils.getElement<HTMLFormElement>(`#form${name}`)
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
interface IInputValues {
    [key: string]: string
}
// endregion