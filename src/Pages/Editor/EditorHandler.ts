import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import Utils from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import SettingsObjects from '../../Classes/SettingObjects.js'
import {BaseDataObjectMap} from '../../Classes/BaseDataObject.js'

export default class EditorHandler {
    private readonly _likeFilter: string
    private readonly _classMap: BaseDataObjectMap
    public constructor(
        like: string,
        classMap: BaseDataObjectMap,
    ) {
        this._likeFilter = like
        this._classMap = classMap
        this.updateSideMenu().then()
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    async updateSideMenu() {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        const classesAndCounts = await DataBaseHelper.loadClasses(this._likeFilter ?? '')
        const title = document.createElement('h3') as HTMLHeadingElement
        title.innerHTML = 'List' // TODO: Customizable?
        this._sideMenuDiv.appendChild(title)
        for(const [group,count] of Object.entries(classesAndCounts)) {
            const link = document.createElement('span') as HTMLSpanElement
            const name = Utils.camelToTitle(group)
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
        this._contentDiv.innerHTML = ''

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group)

        // Dropdown & editor
        const items = await DataBaseHelper.loadFromDatabase(group)
        const dropdown = document.createElement('select') as HTMLSelectElement
        dropdown.id = 'dropdown'
        const dropdownLabel = document.createElement('label') as HTMLLabelElement
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

        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        const editor = new JsonEditor()
        let currentKey = selectKey
        const updateEditor = (event: Event|undefined)=>{
            currentKey = dropdown.value
            editorContainer.innerHTML = ''
            if(currentKey.length > 0) {
                const instance = this._classMap.getInstance(group, items[currentKey]) ?? items[currentKey]
                if(instance) editorContainer.appendChild(editor.build(currentKey, instance))
            }
        }
        dropdown.onchange = updateEditor
        updateEditor(undefined)

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('editor-button', 'delete-button')
        editorDeleteButton.innerHTML = 'Delete'
        editorDeleteButton.onclick = async(event)=>{
            const doDelete = confirm(`Do you want to delete ${group}:${currentKey}?`)
            if(doDelete) {
                const ok = await DataBaseHelper.deleteFromDatabase(group, currentKey)
                if(ok) {
                    alert(`Deletion of ${group}:${currentKey} was successful.`)
                    await this.showListOfItems(group)
                } else {
                    alert(`Deletion of ${group}:${currentKey} failed.`)
                }
            }
        }

        // Save button
        const editorSaveButton = document.createElement('button') as HTMLButtonElement
        editorSaveButton.classList.add('editor-button', 'save-button')
        editorSaveButton.innerHTML = 'Save'
        editorSaveButton.onclick = async(event)=>{
            const data = editor.getData()
            const ok = await DataBaseHelper.saveToDatabase(JSON.stringify(data), group, currentKey)
            if(ok) {
                items[currentKey] = data
                await this.showListOfItems(group, currentKey)
            }
            else alert(`Failed to save ${group}:${currentKey}`)
        }

        this._contentDiv.appendChild(title)
        this._contentDiv.appendChild(dropdownLabel)
        this._contentDiv.appendChild(dropdown)
        this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorSaveButton)
    }
}