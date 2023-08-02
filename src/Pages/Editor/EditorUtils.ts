export class EditorUtils {

    // TODO: Possible move more buttons AND THEIR CODE in here? Make them take parameters for all the variables needed. Possibly.
    
    static getNewButton() {
        const button = document.createElement('button') as HTMLButtonElement
        button.classList.add('main-button', 'new-button')
        button.innerHTML = '✨ New'
        button.title = 'And new entry'
        return button
    }
}