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
         */
        await DefaultsHandler.updatePage()
    }

    private static async updatePage() {
        const container = document.querySelector('#defaults-container') as HTMLDivElement
        const children: HTMLElement[] = []

        const mandatoryExists = await DefaultsHandler.checkIfItemsExists(DefaultObjects.MANDATORY_ENTRIES)
        children.push(await DefaultsHandler.buildImportButton(DefaultObjects.MANDATORY_ENTRIES, 'Mandatory'))
        if(mandatoryExists) children.push(await DefaultsHandler.buildImportButton(DefaultObjects.BONUS_ENTRIES, 'Bonus'))
        children.push(...await DefaultsHandler.buildSection(DefaultObjects.MANDATORY_ENTRIES))
        if(mandatoryExists) children.push(...await DefaultsHandler.buildSection(DefaultObjects.BONUS_ENTRIES))

        container.replaceChildren(...children)
    }

    private static buildImportButton(items: IDefaultObjectList, label: string): HTMLElement {
        const p = document.createElement('p') as HTMLParagraphElement
        const button = document.createElement('button') as HTMLButtonElement
        button.onclick = importMandatory
        button.ontouchstart = importMandatory
        button.innerHTML = `✨ Import missing ${label} items`
        button.classList.add('main-button', 'new-button')
        button.title = `Import all ${label} items that have not already been imported.`
        const status = document.createElement('span') as HTMLSpanElement
        async function importMandatory() {
            await DefaultsHandler.importItems(items, status)
            await DefaultsHandler.updatePage()
        }
        p.replaceChildren(button, status)
        return p
    }

    private static async buildSection(parentList: IDefaultObjectList): Promise<HTMLElement[]> {
        const children: HTMLElement[] = []
        for(const [category, list] of Object.entries(parentList)) {
            const p = document.createElement('p') as HTMLParagraphElement
            const strong = document.createElement('strong') as HTMLSpanElement
            strong.innerHTML = `${Utils.camelToTitle(category)} (${list.length}) `
            p.appendChild(strong)
            p.appendChild(document.createElement('br'))

            for(const item of list) {
                p.appendChild(await DefaultsHandler.buildItem(p, item))
            }
            children.push(p)
        }
        return children
    }

    private static async checkIfItemsExists(entries: IDefaultObjectList): Promise<boolean> {
        for(const list of Object.values(entries)) {
            for(const item of list) {
                const existingItem = await DataBaseHelper.loadItem(item.instance, item.key)
                if(!existingItem) return false
            }
        }
        return true
    }

    private static async importItems(entries: IDefaultObjectList, status: HTMLElement) {
        let total = 0
        let ok = 0
        for(const [listName, list] of Object.entries(entries)) {
            for(const item of list) {
                const existingItem = await DataBaseHelper.loadItem(item.instance, item.key)
                if(!existingItem) {
                    total++
                    const message = `(${ok}/${total}) ${listName}:${item.instance.constructor.name}:${item.key}`
                    status.innerHTML = `${message} Importing...`
                    const imported = await item.importer(item.instance, item.key)
                    await DefaultsHandler.updateButton(item, imported)
                    if(imported) {
                        ok++
                        status.innerHTML = `${message} Imported!`
                    } else {
                        status.innerHTML = `${message} Failed import!`
                    }
                }
            }
        }
        status.innerHTML = ''
    }

    private static async updateButton(item: IDefaultObject, exists: boolean, buttonElement?: HTMLButtonElement) {
        const id = this.getButtonId(item)
        const button = buttonElement ?? document.querySelector(`#${id}`) as HTMLButtonElement
        if(button) {
            button.classList.add('button')
            button.innerHTML = getLabel(exists)
            if(exists) {
                button.title = 'Navigate to item'
                button.classList.remove('disabled')
                button.onclick = navigateToItem
                button.ontouchstart = navigateToItem
            } else {
                button.title = 'Item not available.'
                button.classList.add('disabled')
                button.disabled = true
                button.onclick = null
                button.ontouchstart = null
            }
        }
        async function navigateToItem() {
            const id = await DefaultObjects.loadID(item.instance, item.key)
            window.location.href = `./editor.php?id=${id}`
        }
        function getLabel(exists: boolean) {
            const icon = exists ? '✅' : '❌'
            return `${icon} ${Utils.camelToTitle(item.key)}`
        }
    }

    private static async buildItem(root: HTMLElement, item: IDefaultObject): Promise<HTMLElement> {
        const exists = !!(await DataBaseHelper.loadItem(item.instance, item.key))
        const button = document.createElement('button') as HTMLButtonElement
        button.id = this.getButtonId(item)
        await this.updateButton(item, exists, button)
        return button
    }
    private static getButtonId(item: IDefaultObject) {
        return `${item.instance.constructor.name}-${item.key}`.replace(/[\s&]/g, '').toLowerCase()
    }
}