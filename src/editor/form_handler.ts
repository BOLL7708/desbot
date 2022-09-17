import Utils from '../widget/utils.js'
import SectionHandler from './section_handler.js'
import Data from '../modules/data.js'

const LOCAL_STORAGE_AUTH_KEY = 'BOLL7708_streaming_widget_auth'
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
        const password = this.getAuth() ?? ''
        const authData = await Data.readData<AuthData>('auth.php', password)

        // No auth data on disk, we need to register a password.
        if(!authData) return SectionHandler.show('Register')

        // No password saved in the browser client, we need to login.
        if(password.length == 0) return SectionHandler.show('Login')

        // No database data stored on disk, we need to register that.
        const dbData = await Data.readData<DBData>('db.php', password)
        if(!dbData) return SectionHandler.show('DBSetup')

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
            const ok = await Data.writeData('auth.php', {'password': password}, '')
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
        const ok = await Data.writeData('db.php', inputData, FormHandler.getAuth())
        if(ok) {
            // TODO: Check if can connect to the database, only then we relaunch the setup.
            // TODO: If we couldn't connect to DB, clear out the settings again?!
            FormHandler.setup().then()
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

    private static getAuth(): string {
        return localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ?? ''
    }
    private static storeAuth(password: string) {
        console.log(`Storing auth: ${password}`)
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, password)
    }
    // endregion
}

// region Interfaces
interface IInputValues {
    [key: string]: string
}
// endregion

// region Data Classes
class AuthData {
    hash: string = ''
}
class DBData {
    host: string = ''
    port: number = 0
    username: string = ''
    password: string = ''
}