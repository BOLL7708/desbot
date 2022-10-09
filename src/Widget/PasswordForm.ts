import Color from '../ClassesStatic/colors.js'
import Utils from '../ClassesStatic/Utils.js'
import {LOCAL_STORAGE_AUTH_KEY} from '../ClassesStatic/Data.js'

export default class PasswordForm {
    static spawn() {
        const h2 = document.createElement('h2') as HTMLHeadingElement
        h2.innerHTML = 'Authenticate'

        const inputPassword = document.createElement('input') as HTMLInputElement
        inputPassword.type = 'password'
        inputPassword.name = 'password'

        const inputSubmit = document.createElement('input') as HTMLInputElement
        inputSubmit.type = 'submit'
        inputSubmit.value = 'Login'

        const label = document.createElement('label') as HTMLLabelElement
        label.innerHTML = 'Password: '
        label.appendChild(inputPassword)

        const form = document.createElement('form') as HTMLFormElement
        form.id = 'widgetLoginForm'
        form.style.backgroundColor = Color.White
        form.appendChild(h2)
        form.appendChild(label)
        form.appendChild(inputSubmit)
        form.onsubmit = this.submitForm

        const container = document.querySelector<HTMLDivElement>('#container')
        container?.appendChild(form)
    }

    private static submitForm(event: SubmitEvent) {
        event.preventDefault()
        for(const input of Object.values(event.target ?? {}) as HTMLInputElement[]) {
            if(input.name == 'password') {
                const password = input.value
                if(password.length) {
                    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder(), password)
                    Utils.reload()
                }
            }
        }
    }
}