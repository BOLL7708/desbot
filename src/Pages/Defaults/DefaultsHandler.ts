import DefaultObjects, {IDefaultObject, IDefaultObjectList} from './DefaultObjects.js'
import Utils from '../../Classes/Utils.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'

export default class DefaultsHandler {
    constructor() {
        this.init().then()
    }

    private async init() {
        /*
        TODO
         This should contain a list of defaults that can be imported, if they do not already exist.
         If the post already exists, disable the import button.
         If the import button is clicked, do the import of the class(es) with suitable values.
            An import can be a class and subclasses. Basically a structure, think event + triggers + actions, possibly also presets.
            Some imports might actually depends on some presets... like permissions. Make this into a "MakeFile" system?
            Some imports needs an advanced run: create event, get ID to use as parents for triggers and actions, update event with those references... shit.


         TODO:
           Add tooltips to the buttons.
         */

        const container = document.querySelector('#defaults-container') as HTMLDivElement
        const children: HTMLElement[] = []
        children.push(...await this.buildSection(DefaultObjects.PREREQUISITES))
        children.push(...await this.buildSection(DefaultObjects.COMMANDS))
        container.replaceChildren(...children)
    }

    private async buildSection(parentList: IDefaultObjectList): Promise<HTMLElement[]> {
        const children: HTMLElement[] = []
        for(const [category, list] of Object.entries(parentList)) {
            const p = document.createElement('p') as HTMLParagraphElement
            const strong = document.createElement('strong') as HTMLSpanElement
            strong.innerHTML = `${Utils.camelToTitle(category)} (${list.length}) `
            p.appendChild(strong)

            const importAllButton = document.createElement('button') as HTMLButtonElement
            importAllButton.onclick = importAllItems
            importAllButton.ontouchstart = importAllItems
            importAllButton.innerHTML = `✨ Import All`
            importAllButton.classList.add('main-button', 'new-button')
            importAllButton.title = 'Import all the not already imported entries below.'
            async function importAllItems() {
                for(const item of list) {
                    const existingItem = await DataBaseHelper.loadItem(item.instance, item.key)
                    if(!existingItem) {
                        await item.importer(item.instance, item.key)
                    }
                }
                window.location.reload()
            }
            p.appendChild(importAllButton)
            p.appendChild(document.createElement('br'))

            for(const item of list) {
                const button = await this.buildButton(item)
                p.appendChild(button)
            }
            children.push(p)
        }
        return children
    }



    private async buildButton(item: IDefaultObject): Promise<HTMLElement> {
        const existingItem = await DataBaseHelper.loadItem(item.instance, item.key)
        const icon = existingItem ? '✅' : '✨'

        const title = `${icon} ${Utils.camelToTitle(item.key)}`
        const button = document.createElement('button') as HTMLButtonElement
        button.classList.add('main-button')
        if(existingItem) {
            button.classList.add('disabled')
            button.disabled = true
        } else {
            button.classList.add('new-button')
        }
        button.innerHTML = title
        async function importItem() {
            const success = await item.importer(item.instance, item.key)
            if(success) {
                button.onclick = null
                button.ontouchstart = null
                button.disabled = true
                button.classList.add('disabled')
            }
        }
        button.onclick = importItem
        button.ontouchstart = importItem

        // TODO: Make this detect if already imported, otherwise provide click.
        return button
    }
}