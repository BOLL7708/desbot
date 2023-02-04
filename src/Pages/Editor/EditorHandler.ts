import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import Utils from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import BaseDataObject from '../../Objects/BaseDataObject.js'
import DataObjectMap from '../../Objects/DataObjectMap.js'
import ImportDataObjectClasses from '../../Objects/ImportDataObjectClasses.js'

export default class EditorHandler {
    private readonly _likeFilter: string
    private readonly _forceMainKey: boolean

    private readonly _labelSaveButton = '💾 Save (ctrl+s)'
    private readonly _labelSaveNewButton = '✨ Save New (ctrl+s)'
    private readonly _labelDeleteButton = '💥 Delete'

    static readonly MainKey = 'Main'
    public constructor(
        like: string,
        forceMainKey: boolean = false
    ) {
        ImportDataObjectClasses.init()
        this._likeFilter = like
        this._forceMainKey = forceMainKey
        this.updateSideMenu().then()

        window.onkeydown = (event)=>{
            if(event.key == 's' && event.ctrlKey) {
                if(event.cancelable) event.preventDefault()
                this._editorSaveButton?.click()
            }
        }
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    async updateSideMenu() {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        const classesAndCounts = await DataBaseHelper.loadClasses(this._likeFilter ?? '')
        for(const className of DataObjectMap.getNames(this._likeFilter ?? '')) {
            if(!classesAndCounts.hasOwnProperty(className)) {
                // Add missing classes so they can still be edited
                classesAndCounts[className] = 0
            }
        }

        const title = document.createElement('h3') as HTMLHeadingElement
        title.innerHTML = 'List' // TODO: Customizable?
        this._sideMenuDiv.replaceChildren(title)
        for(const [group,count] of Object.entries(classesAndCounts).sort()) {
            const link = document.createElement('span') as HTMLSpanElement
            const name = Utils.camelToTitle(group, true)
            const a = document.createElement('a') as HTMLAnchorElement
            a.href = '#'
            a.innerHTML = `${name}</a>: <strong>${count}</strong>`
            a.onclick = (event: Event) => {
                if(event.cancelable) event.preventDefault()
                this.showListOfItems(group).then()
            }
            link.appendChild(a)
            link.appendChild(document.createElement('br') as HTMLBRElement)
            this._sideMenuDiv.appendChild(link)
        }
    }

    private _contentDiv: HTMLDivElement|undefined
    private _editor: JsonEditor|undefined
    private _editorSaveButton: HTMLButtonElement|undefined
    private async showListOfItems(group: string, selectKey: string = '') {
        if(!this._contentDiv) {
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
        }

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group, true)

        // Description
        const description = document.createElement('p') as HTMLParagraphElement
        description.innerHTML = DataObjectMap.getMeta(group)?.description ?? 'No description.'

        // Dropdown & editor
        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        this._editor = new JsonEditor()
        let currentKey = selectKey

        const dropdown = document.createElement('select') as HTMLSelectElement
        const dropdownLabel = document.createElement('label') as HTMLLabelElement
        const updateEditor = (event: Event|undefined, clear: boolean = false, markAsDirty: boolean = false)=>{
            let instance: BaseDataObject|undefined = undefined
            if(clear) {
                currentKey = this._forceMainKey ? EditorHandler.MainKey : ''
                instance = DataObjectMap.getInstance(group, {})
                if(!this._forceMainKey) editorSaveButton.innerHTML = this._labelSaveNewButton
            } else {
                currentKey = this._forceMainKey ? EditorHandler.MainKey : dropdown.value
                if(currentKey.length > 0) {
                    instance = DataObjectMap.getInstance(group, items[currentKey] ?? {}) ?? items[currentKey] // The last ?? is for test settings that has no class.
                } else {
                    instance = DataObjectMap.getInstance(group, {})
                }
                editorSaveButton.innerHTML = this._labelSaveButton
            }
            if(instance) {
                editorContainer.replaceChildren(this._editor?.build(currentKey, instance, markAsDirty, this._forceMainKey) ?? '')
            }
        }

        const items = await DataBaseHelper.loadJson(group)
        if(this._forceMainKey) {
            dropdown.style.display = 'none'
            dropdownLabel.style.display = 'none'
            updateEditor(undefined, true)
        } else {
            dropdown.id = 'dropdown'
            dropdownLabel.htmlFor = dropdown.id
            dropdownLabel.innerText = 'Entries: '
            if(this._contentDiv && items) {
                for(const key of Object.keys(items)) {
                    const option = document.createElement('option') as HTMLOptionElement
                    option.innerText = key
                    option.value = key
                    if(selectKey == key) option.selected = true
                    dropdown.appendChild(option)
                }
            }
            // dropdown.onblur = updateEditor
            dropdown.onclose = updateEditor
            dropdown.onchange = updateEditor
        }

        // New button
        const editorNewButton = document.createElement('button') as HTMLButtonElement
        editorNewButton.classList.add('editor-button', 'new-button')
        editorNewButton.innerHTML = '✨ New'
        editorNewButton.title = 'And new entry'
        editorNewButton.onclick = async (event)=>{
            updateEditor(undefined, true)
        }

        // Reset button
        const editorResetButton = document.createElement('button') as HTMLButtonElement
        editorResetButton.classList.add('editor-button', 'reset-button')
        editorResetButton.innerHTML = '🧼 Reset'
        editorResetButton.title = 'Reset to default values'
        editorResetButton.onclick = async (event)=>{
            updateEditor(undefined, true, this._forceMainKey)
        }

        // Reload button
        const editorReloadButton = document.createElement('button') as HTMLButtonElement
        editorReloadButton.classList.add('editor-button', 'reload-button')
        editorReloadButton.innerHTML = '💫 Reload'
        editorReloadButton.title = 'Reload stored values'
        editorReloadButton.onclick = async (event)=>{
            updateEditor(undefined)
        }

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('editor-button', 'delete-button')
        editorDeleteButton.innerHTML = this._labelDeleteButton
        editorDeleteButton.tabIndex = -1
        editorDeleteButton.onclick = async(event)=>{
            const doDelete = confirm(`Do you want to delete ${group} : ${currentKey}?`)
            if(doDelete) {
                const ok = await DataBaseHelper.deleteJson(group, currentKey)
                if(ok) {
                    // alert(`Deletion of ${group} : ${currentKey} was successful.`)
                    this.updateSideMenu().then()
                    this.showListOfItems(group).then()
                } else {
                    alert(`Deletion of ${group} : ${currentKey} failed.`)
                }
            }
        }

        // Save button
        const editorSaveButton = document.createElement('button') as HTMLButtonElement
        editorSaveButton.classList.add('editor-button', 'save-button')
        editorSaveButton.innerHTML = this._labelSaveButton
        editorSaveButton.onclick = (event)=>{
            this.saveData(currentKey, group).then()
        }
        this._editorSaveButton = editorSaveButton

        updateEditor(undefined)
        this._contentDiv.replaceChildren(title)
        this._contentDiv.appendChild(description)
        if(dropdownLabel) this._contentDiv.appendChild(dropdownLabel)
        this._contentDiv.appendChild(dropdown)
        if(this._forceMainKey) this._contentDiv.appendChild(editorResetButton)
        else this._contentDiv.appendChild(editorNewButton)
        this._contentDiv.appendChild(editorReloadButton)
        this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorSaveButton)
    }

    private async saveData(groupKey: string, groupClass: string) {
        if(this._editor) {
            const data = this._editor.getData()
            const newGroupKey = this._editor.getKey()
            const resultingGroupKey = await DataBaseHelper.saveJson(JSON.stringify(data), groupClass, groupKey, newGroupKey)
            if(resultingGroupKey) {
                this.updateSideMenu().then()
                this.showListOfItems(groupClass, resultingGroupKey).then()
            } else {
                alert(`Failed to save ${groupClass}:${groupKey}|${newGroupKey}`)
            }
        }
    }
}