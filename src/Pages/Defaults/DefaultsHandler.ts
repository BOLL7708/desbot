import DefaultData, {IDefaultObject, IDefaultObjectList} from './DefaultData.js'
import Utils from '../../Classes/Utils.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataMap, {DataObjectMeta} from '../../Objects/DataMap.js'

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

        const LABEL_PREREQUISITE = 'Prerequisite'
        const LABEL_SYSTEM = 'System'
        const LABEL_BONUS = 'Bonus'
        const LABEL_BOLL = 'BOLL' // TODO: Temporary

        // Checks
        const prerequisiteExists = await DefaultsHandler.checkIfItemsExists(DefaultData.PREREQUISITE_ENTRIES)
        const systemExists = prerequisiteExists && await DefaultsHandler.checkIfItemsExists(DefaultData.SYSTEM_ENTRIES)

        // Import Buttons
        children.push(await DefaultsHandler.buildImportButton(DefaultData.PREREQUISITE_ENTRIES, LABEL_PREREQUISITE))
        if(prerequisiteExists) children.push(await DefaultsHandler.buildImportButton(DefaultData.SYSTEM_ENTRIES, LABEL_SYSTEM))
        if(systemExists) {
            children.push(await DefaultsHandler.buildImportButton(DefaultData.BONUS_ENTRIES, LABEL_BONUS))
            children.push(await DefaultsHandler.buildImportButton(DefaultData.BOLL_ENTRIES, LABEL_BOLL)) // TODO: Temporary
        }

        // Reference Buttons
        children.push(await DefaultsHandler.buildSection(DefaultData.PREREQUISITE_ENTRIES, LABEL_PREREQUISITE))
        if(prerequisiteExists) children.push(await DefaultsHandler.buildSection(DefaultData.SYSTEM_ENTRIES, LABEL_SYSTEM))
        if(systemExists) {
            children.push(await DefaultsHandler.buildSection(DefaultData.BONUS_ENTRIES, LABEL_BONUS))
            children.push(await DefaultsHandler.buildSection(DefaultData.BOLL_ENTRIES, LABEL_BOLL)) // TODO: Temporary
        }

        container.replaceChildren(...children)
    }

    private static buildImportButton(items: IDefaultObjectList, label: string): HTMLElement {
        const p = document.createElement('p') as HTMLParagraphElement
        const button = document.createElement('button') as HTMLButtonElement
        button.onclick = importMandatory
        button.ontouchstart = importMandatory
        button.innerHTML = `✨ Import missing ${label} entries`
        button.classList.add('main-button', 'new-button')
        button.title = `Import all ${label} items that do not already exist.`
        const status = document.createElement('span') as HTMLSpanElement
        async function importMandatory() {
            await DefaultsHandler.importItems(items, status)
            await DefaultsHandler.updatePage()
        }
        p.replaceChildren(button, status)
        return p
    }

    private static async buildSection(parentList: IDefaultObjectList, label: string): Promise<HTMLElement> {
        const children: HTMLElement[] = []
        const title = document.createElement('h3')
        title.innerHTML = label
        children.push(title)
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
        const div = document.createElement('div') as HTMLDivElement
        div.append(...children)
        return div
    }

    private static async checkIfItemsExists(entries: IDefaultObjectList): Promise<boolean> {
        for(const list of Object.values(entries)) {
            for(const item of list) {
                const existingItem = await DataBaseHelper.loadItem(item.instance, item.key.toString())
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
                const existingItem = await DataBaseHelper.loadItem(item.instance, item.key.toString())
                if(!existingItem) {
                    total++
                    const message = `(${ok}/${total}) ${listName}:${item.instance.constructor.name}:${item.key}`
                    status.innerHTML = `${message} Importing...`
                    const imported = await item.importer(item.instance, item.key.toString())
                    await DefaultsHandler.updateButton(item, !!imported)
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
        const meta = DataMap.getMeta(item.instance.constructor.name)
        const mappedLabel = meta?.keyMap?.[item.key.toString()]
        const button = buttonElement ?? document.querySelector(`#${id}`) as HTMLButtonElement
        if(button) {
            button.classList.add('button')
            button.innerHTML = getLabel(exists, mappedLabel)
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
            const id = await DefaultData.loadID(item.instance, item.key.toString())
            window.location.href = `./editor.php?id=${id}`
        }
        function getLabel(exists: boolean, mappedLabel?: string) {
            const icon = exists ? '✅' : '❌'
            return `${icon} ${Utils.camelToTitle(mappedLabel ?? item.key.toString())}`
        }
    }

    private static async buildItem(root: HTMLElement, item: IDefaultObject): Promise<HTMLElement> {
        const exists = !!(await DataBaseHelper.loadItem(item.instance, item.key.toString()))
        const button = document.createElement('button') as HTMLButtonElement
        button.id = this.getButtonId(item)
        await this.updateButton(item, exists, button)
        return button
    }
    private static getButtonId(item: IDefaultObject) {
        return `${item.instance.constructor.name}-${item.key}`.replace(/[\s&]/g, '').toLowerCase()
    }
}