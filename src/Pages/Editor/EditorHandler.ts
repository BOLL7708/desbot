import DataBaseHelper, {IDataBaseItem} from '../../Classes/DataBaseHelper.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import BaseDataObject from '../../Objects/BaseDataObject.js'
import DataObjectMap from '../../Objects/DataObjectMap.js'

export default class EditorHandler {
    private _state = new EditorPageState()

    private readonly _labelSaveButton = '💾 Save (ctrl+s)'
    private readonly _labelSaveAndCloseButton = '💾 Save & close (ctrl+s)'
    private readonly _labelSaveNewButton = '✨ Save new (ctrl+s)'
    private readonly _labelSaveNewAndCloseButton = '✨ Save new & close (ctrl+s)'
    private readonly _labelDeleteButton = '💥 Delete'
    private _unsavedChanges: boolean = false

    static readonly MainKey = 'Main'
    public constructor() {
        this.init().then()
    }
    private async init() {
        const urlParams = Utils.getUrlParams()
        const rowId = urlParams.get('id') ?? undefined
        let rowItem = await DataBaseHelper.loadById(rowId)
        if(rowItem) {
            this._state.groupKey = rowItem.key
            this._state.groupClass = rowItem.class
        }
        if(urlParams.has('k')) this._state.groupKey = decodeURIComponent(urlParams.get('k') ?? '')
        if(urlParams.has('c')) this._state.groupClass = decodeURIComponent(urlParams.get('c') ?? '')
        if(urlParams.has('n')) this._state.newItem = !!urlParams.get('n')
        if(urlParams.has('p')) this._state.parentId = parseInt(urlParams.get('p') ?? '')
        if(urlParams.has('m')) this._state.minimal = !!urlParams.get('m')
        let group = urlParams.get('g') ?? this._state.groupClass.substring(0,1).toLowerCase()

        switch(group) {
            case 's': this._state.likeFilter = 'Setting'; break
            case 'c': this._state.likeFilter = 'Config'; this._state.forceMainKey = true; break
            case 'p': this._state.likeFilter = 'Preset'; break
            case 'e': this._state.likeFilter = 'Event'; break
            case 't': this._state.likeFilter = 'Trigger'; break
            case 'a': this._state.likeFilter = 'Action'; break
            default: group = ''
        }
        this._state.group = group

        this.updateSideMenu().then()
        if(this._state.groupClass.length > 0) this.buildEditorControls(this._state.groupClass, this._state.groupKey, this._state.parentId).then()

        window.onkeydown = (event)=>{
            if(event.key == 's' && event.ctrlKey) {
                if(event.cancelable) event.preventDefault()
                this._editorSaveButton?.click()
            }
        }
        window.onpopstate = (event)=>{
            if(event.state) {
                this._state = event.state
                this.updateSideMenu().then()
                this.buildEditorControls(this._state.groupClass, this._state.groupKey, this._state.parentId).then()
            }
        }
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    async updateSideMenu() {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        if(!this._sideMenuDiv) return // Side menu does not exist in minimal mode.

        const classesAndCounts = await DataBaseHelper.loadClassesWithCounts(this._state.likeFilter)
        for(const className of DataObjectMap.getNames(this._state.likeFilter)) {
            if(!classesAndCounts.hasOwnProperty(className)) {
                // Add missing classes so they can still be edited
                classesAndCounts[className] = 0
            }
        }

        const title = document.createElement('h3') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(this._state.likeFilter, EUtilsTitleReturnOption.OnlyFirstWord) + ' Entries'
        this._sideMenuDiv.replaceChildren(title)
        for(const [group,count] of Object.entries(classesAndCounts).sort()) {
            const link = document.createElement('span') as HTMLSpanElement
            const name = Utils.camelToTitle(group, EUtilsTitleReturnOption.SkipFirstWord)
            const a = document.createElement('a') as HTMLAnchorElement
            a.href = '#'
            a.innerHTML = `${name}</a>: <strong>${count}</strong>`
            a.onclick = (event: Event) => {
                if(event.cancelable) event.preventDefault()
                this.buildEditorControls(group).then()
            }
            link.appendChild(a)
            link.appendChild(document.createElement('br') as HTMLBRElement)
            this._sideMenuDiv.appendChild(link)
        }
    }

    private _contentDiv: HTMLDivElement|undefined
    private _editor: JsonEditor|undefined
    private _editorSaveButton: HTMLButtonElement|undefined
    private async buildEditorControls(
        group: string,
        selectKey: string = '',
        parentId?: number,
    ) {
        await this.saveOnReplacingEditorContents()
        this._state.groupClass = group
        this._state.groupKey = selectKey

        if(!this._contentDiv) {
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
        }

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group, EUtilsTitleReturnOption.SkipFirstWord)

        // Description
        const description = document.createElement('p') as HTMLParagraphElement
        description.innerHTML = DataObjectMap.getMeta(group)?.description ?? 'No description.'

        // Dropdown & editor
        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        this._editor = new JsonEditor()
        this._editor.setModifiedStatusListener(this.updateModifiedState.bind(this))

        const dropdown = document.createElement('select') as HTMLSelectElement
        const dropdownLabel = document.createElement('label') as HTMLLabelElement
        const updateEditor = async(
            event: Event|undefined,
            clear: boolean = false,
            markAsDirty: boolean = false
        ): Promise<boolean> =>{
            await this.saveOnReplacingEditorContents()
            this._state.newItem = false // Reset it as we only need that to affect the initial load.
            let instance: BaseDataObject|undefined = undefined
            let resultingKey = selectKey
            if(clear) {
                resultingKey = this._state.forceMainKey ? EditorHandler.MainKey : ''
                instance = await DataObjectMap.getInstance(group, {})
                if(!this._state.forceMainKey) editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveNewAndCloseButton : this._labelSaveNewButton
            } else {
                resultingKey = this._state.forceMainKey ? EditorHandler.MainKey : dropdown.value
                if(resultingKey.length > 0) {
                    const item = (items as IDataBaseItem<any>[]).find(item => item.key == resultingKey)
                    instance = await DataObjectMap.getInstance(group, item?.data ?? {}) ?? item?.data ?? {} // The last ?? is for test settings that has no class.
                } else {
                    instance = await DataObjectMap.getInstance(group, {})
                }
                editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
            }
            if(instance && instance?.constructor.name !== 'Object') {
                this._state.groupKey = resultingKey
                const item = await DataBaseHelper.loadItem(instance, resultingKey)
                editorContainer.replaceChildren(
                    await this._editor?.build(
                        resultingKey,
                        instance, 
                        item?.id,
                        !!parentId ? parentId : item?.pid ?? undefined,
                        markAsDirty,
                        this._state.forceMainKey
                    ) ?? ''
                )
            } else {
                console.warn(`Could not load instance for ${group}, class is: ${instance?.constructor.name}`)
            }
            return true
        }

        const items = await DataBaseHelper.loadJson(group, undefined, parentId)
        if(this._state.forceMainKey) {
            dropdown.style.display = 'none'
            dropdownLabel.style.display = 'none'
            await updateEditor(undefined, true, false)
        } else {
            dropdown.id = 'dropdown'
            dropdownLabel.htmlFor = dropdown.id
            dropdownLabel.innerText = 'Entries: '
            if(this._contentDiv && items) {
                for(const item of items) {
                    const option = document.createElement('option') as HTMLOptionElement
                    option.innerText = item.key
                    option.value = item.key
                    if(selectKey == item.key) option.selected = true
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
            await updateEditor(undefined, true)
        }

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('editor-button', 'delete-button')
        editorDeleteButton.style.marginRight = '10em'
        editorDeleteButton.innerHTML = this._labelDeleteButton
        editorDeleteButton.tabIndex = -1
        editorDeleteButton.onclick = async(event)=>{
            const doDelete = confirm(`Do you want to delete ${group} : ${this._state.groupKey}?`)
            if(doDelete) {
                const ok = await DataBaseHelper.deleteJson(group, this._state.groupKey)
                if(ok) {
                    DataBaseHelper.clearReferences(group) // To make reference lists reload to remove the deleted entry.
                    this.updateSideMenu().then()
                    this.buildEditorControls(group, '', this._state.parentId).then()
                } else {
                    alert(`Deletion of ${group} : ${this._state.groupKey} failed.`)
                }
            }
        }

        // Save button
        const editorSaveButton = document.createElement('button') as HTMLButtonElement
        editorSaveButton.classList.add('editor-button', 'save-button')
        editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
        editorSaveButton.onclick = (event)=>{
            this.saveData(this._state.groupKey, group, this._state.parentId).then()
        }
        this._editorSaveButton = editorSaveButton

        // Export button
        const editorExportButton = document.createElement('button') as HTMLButtonElement
        editorExportButton.classList.add('editor-button', 'export-button')
        editorExportButton.innerHTML = '📤 Export'
        editorExportButton.title = 'Export current editor data as JSON to the system clipboard.'
        editorExportButton.onclick = async (event)=>{
            const result = await Utils.writeToClipboard(this._editor?.getData())
            if(!result) alert('Unable to export, clipboard was not updated.')
        }

        // Import button
        const editorImportButton = document.createElement('button') as HTMLButtonElement
        editorImportButton.classList.add('editor-button', 'import-button')
        editorImportButton.innerHTML = '📥 Import'
        editorImportButton.title = 'Import the current system clipboard JSON data into the editor.'
        editorImportButton.onclick = async (event)=>{
            const result = await Utils.readFromClipboard(true)
            if(!result) alert('Unable to import, clipboard unavailable or contains invalid JSON data.')
            else this._editor?.setData(result)
        }

        await updateEditor(undefined, this._state.newItem, false)
        this._contentDiv.replaceChildren(title)
        this._contentDiv.appendChild(description)
        if(!this._state.minimal) {
            if(dropdownLabel) this._contentDiv.appendChild(dropdownLabel)
            this._contentDiv.appendChild(dropdown)
            if(!this._state.forceMainKey) this._contentDiv.appendChild(editorNewButton)
        }
        this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorSaveButton)
        this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorExportButton)
        this._contentDiv.appendChild(editorImportButton)
    }

    private async saveData(groupKey: string, groupClass: string, parentId?: number): Promise<boolean> {
        if(this._editor) {
            const data = this._editor.getData()
            const newGroupKey = this._editor.getKey()
            const resultingGroupKey = await DataBaseHelper.saveJson(JSON.stringify(data), groupClass, groupKey, newGroupKey, parentId)
            if(resultingGroupKey) {
                if(newGroupKey) DataBaseHelper.clearReferences(groupClass) // To make reference lists reload with the new/updated item.
                await this.updateSideMenu()
                this.updateModifiedState(false)
                await this.buildEditorControls(groupClass, resultingGroupKey, this._state.parentId)
                return true
            } else {
                alert(`Failed to save ${groupClass}:${groupKey}|${newGroupKey}`)
            }
        }
        return false
    }

    private updateModifiedState(modified: boolean) {
        this._unsavedChanges = Utils.clone(modified)
        if(modified) {
            window.onbeforeunload = (event)=>{
                this.saveData(this._state.groupKey, this._state.groupClass, this._state.parentId).then()
                return undefined
            }
        } else {
            window.onbeforeunload = null
        }
     }

    private async saveOnReplacingEditorContents(): Promise<boolean> {
        if(this._unsavedChanges) {
            const shouldSave = confirm('There are still unsaved changes, do you want to save?')
            if(shouldSave) return await this.saveData(this._state.groupKey, this._state.groupClass, this._state.parentId)
        }
        return false
    }
}

class EditorPageState {
    group: string = ''
    likeFilter: string = ''
    forceMainKey: boolean = false
    groupClass: string = ''
    groupKey: string = ''
    newItem: boolean = false
    parentId: number = 0
    minimal: boolean = false
}