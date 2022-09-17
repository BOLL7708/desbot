import Utils from '../widget/utils.js'
import SectionHandler from './section_handler.js'
import Data from '../modules/data.js'

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

    static init() {
        for(const [name, form] of Object.entries(FormHandler.formElements) as [TForm, HTMLFormElement|null][]) {
            if(form) form.onsubmit = this.formSubmits[name]
        }
    }

    // region Form Logic
    static async submitRegister(event: SubmitEvent): Promise<boolean> {
        event.preventDefault()
        const inputs = FormHandler.getFormInputs(event.target)
        // console.table(inputs)
        // SectionHandler.show('Login')
        return Data.writeData('password.php', {'password': inputs.password ?? '' })
    }
    static async submitLogin(event: SubmitEvent) {
        event.preventDefault()
        const inputs = FormHandler.getFormInputs(event.target)
        console.table(inputs)
        SectionHandler.show('DBSetup')
    }
    static async submitDBSetup(event: SubmitEvent) {
        event.preventDefault()
        const inputs = FormHandler.getFormInputs(event.target)
        console.table(inputs)
    }
    // endregion

    // region Helpers

    static getFormInputs(target: EventTarget|null): IInputValues {
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
    // endregion
}

// region Interfaces
interface IInputValues {
    [key: string]: string
}
// endregion