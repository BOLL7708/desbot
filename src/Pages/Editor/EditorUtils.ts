export class EditorUtils {

    static getNewButton() {
        const button = document.createElement('button') as HTMLButtonElement
        button.classList.add('main-button', 'new-button')
        button.innerHTML = '✨ New'
        button.title = 'And new entry'
        return button
    }
}