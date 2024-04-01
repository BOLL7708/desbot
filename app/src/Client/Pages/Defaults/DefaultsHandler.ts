import DefaultData, {EKeys, IDefaultObject, IDefaultObjectList} from './DefaultData.js'
import DataBaseHelper from '../../../Shared/Classes/DataBaseHelper.js'
import {PresetEventCategory} from '../../../Shared/Objects/Preset/PresetEventCategory.js'
import Utils from '../../../Shared/Classes/Utils.js'
import DataMap from '../../../Shared/Objects/DataMap.js'

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
        // const LABEL_BOLL = 'BOLL' // TODO: Temporary, add something that matches a specific twitch user to filter on this for testing.

        // Checks
        const prerequisiteExists = await DefaultsHandler.checkIfItemsExists(DefaultData.PREREQUISITE_ENTRIES)
        const systemExists = prerequisiteExists && await DefaultsHandler.checkIfItemsExists(DefaultData.SYSTEM_ENTRIES)

        // Import, Update & Delete Buttons
        children.push(await DefaultsHandler.buildButtons(DefaultData.PREREQUISITE_ENTRIES, LABEL_PREREQUISITE))
        if(prerequisiteExists) children.push(await DefaultsHandler.buildButtons(DefaultData.SYSTEM_ENTRIES, LABEL_SYSTEM, EKeys.EventCategoryDefaultImports))
        if(systemExists) {
            children.push(await DefaultsHandler.buildButtons(DefaultData.BONUS_ENTRIES, LABEL_BONUS, EKeys.EventCategoryBonusImports))
            // children.push(await DefaultsHandler.buildButtons(DefaultData.BOLL_ENTRIES, LABEL_BOLL)) // TODO: Temporary
        }

        // Reference Buttons
        children.push(await DefaultsHandler.buildSection(DefaultData.PREREQUISITE_ENTRIES, LABEL_PREREQUISITE))
        if(prerequisiteExists) children.push(await DefaultsHandler.buildSection(DefaultData.SYSTEM_ENTRIES, LABEL_SYSTEM))
        if(systemExists) {
            children.push(await DefaultsHandler.buildSection(DefaultData.BONUS_ENTRIES, LABEL_BONUS))
            // children.push(await DefaultsHandler.buildSection(DefaultData.BOLL_ENTRIES, LABEL_BOLL)) // TODO: Temporary
        }

        container.replaceChildren(...children)
    }

    private static async buildButtons(items: IDefaultObjectList, label: string, deleteCategoryWithKey?: string): Promise<HTMLElement> {
        const p = document.createElement('p') as HTMLParagraphElement
        const status = document.createElement('span') as HTMLSpanElement
        function buildButton(label: string, override: boolean) {
            const button = document.createElement('button') as HTMLButtonElement
            button.onclick = importMandatory
            button.ontouchstart = importMandatory
            button.innerHTML = (override ? `💫 Update or import all` : `✨ Import missing`) + ` ${label} entries`
            button.classList.add('main-button', override ? 'new-button' : 'save-button')
            button.title = override
                ? `This will import or update all ${label} entries, \nregardless if they exist in the database or not, \ndo this to get the latest data but retain IDs.`
                : `This will import all missing ${label} entries, \nthose that do not already exist in the database, \nthis will skip any already existing entries.`
            async function importMandatory() {
                let doImport = true
                if(override) doImport = confirm(`Are you sure you want to import or overwrite all ${label} entries?`)
                if(doImport) {
                    const resultMessage = await DefaultsHandler.importItems(items, status, override)
                    setTimeout(()=>{
                        alert(resultMessage)
                    }, 500)
                    await DefaultsHandler.updatePage()
                }
            }
            return button
        }

        // Delete Buttons
        function buildDeleteButton(categoryName: string, categoryId: number) {
            const button = document.createElement('button') as HTMLButtonElement
            button.onclick = async () => {
                const doDelete = confirm(`Are you sure you want to delete all events in the ${categoryName} category?`)
                if(doDelete) {
                    const result = await DataBaseHelper.deleteCategory(categoryId)
                    status.innerHTML = 'Deleting entries...'
                    const resultMessage = result ? `Deleted all events in the ${categoryName} category.` : `Failed to delete all events in the ${categoryName} category.`
                    setTimeout(()=>{
                        alert(resultMessage)
                    }, 500)
                    await DefaultsHandler.updatePage()
                }
            }
            button.innerHTML = `🗑️ Delete all ${label} entries`
            button.title = `This will completely delete all events in the ${categoryName} category, \nuse this if you want to reimport these events with a clean slate.`
            button.classList.add('main-button', 'delete-button')
            return button
        }
        const children = [buildButton(label, false)] // , buildButton(label, true)] // TODO: Update buttons duplicate actions... bad.
        if(deleteCategoryWithKey) {
            const deleteCategoryId = await DataBaseHelper.loadID(PresetEventCategory.ref.build(), deleteCategoryWithKey)
            if(deleteCategoryId) children.push(buildDeleteButton(deleteCategoryWithKey, deleteCategoryId))
        }
        p.replaceChildren(...children, status)
        return p
    }

    private static buildDeleteButton(category: PresetEventCategory) {
        const button = document.createElement('button') as HTMLButtonElement
        button.onclick = async () => {
            const doDelete = confirm(`Are you sure you want to delete the ${category} category?`)
            if(doDelete) {
                // await DataBaseHelper.deleteItem(category)
                await DefaultsHandler.updatePage()
            }
        }
        button.innerHTML = `🗑️ Delete all entries in the ${category} category, use this if you want to restart your defaults.`
        button.classList.add('delete-button')
        return button
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

    private static async importItems(entries: IDefaultObjectList, status: HTMLElement, override: boolean = false): Promise<string> {
        let total = 0
        let ok = 0
        const failedKeys: string[] = []
        const entryCount = Object.values(entries).reduce((acc, list) => acc + list.length, 0)
        status.innerHTML = override ? 'Importing or updating' : 'Importing'
        for(const [listName, list] of Object.entries(entries)) {
            for(const item of list) {
                const existingItem = await DataBaseHelper.loadItem(item.instance, item.key.toString())
                const doImport = override || !existingItem
                if(doImport) {
                    total++
                    const imported = await item.importer(existingItem?.data ?? item.instance, item.key.toString())
                    await DefaultsHandler.updateButton(item, !!imported)
                    if(imported) {
                        ok++
                    } else {
                        failedKeys.push(item.key.toString())
                    }
                    status.innerHTML += ' .'
                }
            }
        }
        const skipped = entryCount - total
        return (override ? 'Imported or updated' : 'Imported')
            + ` ${ok} out of ${total} items.`
            + (skipped > 0 ? `\nSkipped ${skipped} items.` : '')
            + (failedKeys.length > 0 ? `\nFailed entries: ${failedKeys.join(', ')}` : '')
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
            window.location.href = `../../../../../php/editor.php`
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