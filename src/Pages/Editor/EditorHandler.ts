import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import Utils from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import SettingsObjects from '../../Classes/SettingObjects.js'
import BaseDataObject, {BaseDataObjectMap} from '../../Classes/BaseDataObject.js'

export default class EditorHandler {
    private readonly _likeFilter: string
    private readonly _classMap: BaseDataObjectMap
    private readonly _forceMainKey: boolean
    public constructor(
        like: string,
        classMap: BaseDataObjectMap,
        forceMainKey: boolean = false
    ) {
        this._likeFilter = like
        this._classMap = classMap
        this._forceMainKey = forceMainKey
        this.updateSideMenu().then()
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    async updateSideMenu() {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        const classesAndCounts = await DataBaseHelper.loadClasses(this._likeFilter ?? '')
        for(const className of this._classMap.getNames()) {
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
    private async showListOfItems(group: string, selectKey: string = '') {
        if(!this._contentDiv) {
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
        }

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group, true)

        // Description
        const description = document.createElement('p') as HTMLParagraphElement
        description.innerHTML = this._classMap.getDescription(group) ?? 'No description.'

        // Dropdown & editor
        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        const editor = new JsonEditor()
        let currentKey = selectKey

        const dropdown = document.createElement('select') as HTMLSelectElement
        const dropdownLabel = document.createElement('label') as HTMLLabelElement
        const updateEditor = (event: Event|undefined, clear: boolean = false, markAsDirty: boolean = false)=>{
            let instance: BaseDataObject|undefined = undefined
            if(clear) {
                currentKey = this._forceMainKey ? 'Main' : ''
                instance = this._classMap.getInstance(group, {})
                if(!this._forceMainKey) editorSaveButton.innerHTML =  '✨ Save New'
            } else {
                currentKey = this._forceMainKey ? 'Main' : dropdown.value
                if(currentKey.length > 0) {
                    instance = this._classMap.getInstance(group, items[currentKey] ?? {}) ?? items[currentKey] // The last ?? is for test settings that has no class.
                } else {
                    instance = this._classMap.getInstance(group, {})
                }
                editorSaveButton.innerHTML = '💾 Save'
            }
            if(instance) {
                const documentation = this._classMap.getDocumentation(group)
                const arrayTypes = this._classMap.getArrayTypes(group)
                editorContainer.replaceChildren(editor.build(currentKey, instance, documentation, arrayTypes, markAsDirty, this._forceMainKey))
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

        // New or reset button
        const editorNewOrResetButton = document.createElement('button') as HTMLButtonElement
        editorNewOrResetButton.classList.add('editor-button', this._forceMainKey ? 'reset-button' : 'new-button')
        editorNewOrResetButton.innerHTML = this._forceMainKey ? '🧼 Reset to defaults' : '✨ New'
        editorNewOrResetButton.onclick = async (event)=>{
            updateEditor(undefined, true, this._forceMainKey)
        }

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('editor-button', 'delete-button')
        editorDeleteButton.innerHTML = '💥 Delete'
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
        editorSaveButton.innerHTML = '💾 Save'
        editorSaveButton.onclick = async(event)=>{
            const data = editor.getData()
            const newKey = editor.getKey()
            const key = await DataBaseHelper.saveJson(JSON.stringify(data), group, currentKey, newKey)
            if(key) {
                this.updateSideMenu().then()
                this.showListOfItems(group, key).then()
            } else {
                alert(`Failed to save ${group}:${currentKey}|${newKey}`)
            }
        }

        updateEditor(undefined)
        this._contentDiv.replaceChildren(title)
        this._contentDiv.appendChild(description)
        if(dropdownLabel) this._contentDiv.appendChild(dropdownLabel)
        this._contentDiv.appendChild(dropdown)
        this._contentDiv.appendChild(editorNewOrResetButton)
        this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorSaveButton)
    }
}