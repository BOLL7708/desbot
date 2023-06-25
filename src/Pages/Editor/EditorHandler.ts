import DataBaseHelper, {IDataBaseItem} from '../../Classes/DataBaseHelper.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import BaseDataObject from '../../Objects/BaseDataObject.js'
import DataObjectMap from '../../Objects/DataObjectMap.js'
import {ConfigEditor} from '../../Objects/Config/ConfigEditor.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import RegisterObjects from '../../Objects/RegisterObjects.js'

export default class EditorHandler {
    private _state = new EditorPageState()

    private readonly _labelSaveButton: string = '💾 Save (ctrl+s)'
    private readonly _labelSaveAndCloseButton: string = '💾 Save & close (ctrl+s)'
    private readonly _labelDeleteButton: string = '💥 Delete (shift+del)'
    private readonly _labelDeleteAndCloseButton: string = '💥 Delete & close (shift+del)'
    private readonly _labelDeleteResetButton: string = '💥 Reset (shift+del)'
    private _unsavedChanges: boolean = false

    public constructor() {
        this.init().then()
    }

    private _containerDiv: HTMLDivElement|undefined
    private _coverDiv: HTMLDivElement|undefined

    private async init() {
        RegisterObjects.register()
        TwitchHelixHelper.loadNamesForUsersWhoLackThem().then()

        window.onunload = (event)=>{
            if(this._state.minimal) window.opener.postMessage(null) // Cancel cover in parent window
        }
        if(!this._containerDiv) {
            this._containerDiv = document.querySelector('#container') as HTMLDivElement
        }
        if(!this._coverDiv) {
            this._coverDiv = document.createElement('div') as HTMLDivElement
            this._coverDiv.classList.add('cover')
            this._coverDiv.style.display = 'none'

            const coverText = document.createElement('p') as HTMLParagraphElement
            coverText.innerHTML = 'Waiting for result... '

            const coverButton = document.createElement('button') as HTMLButtonElement
            coverButton.classList.add('main-button')
            coverButton.innerHTML = 'Abort'
            coverButton.onclick = (event)=>{
                if(this._childEditorWindow) {
                    this._childEditorWindow.close()
                } else {
                    this.toggleCover(false)
                }
            }

            coverText.appendChild(coverButton)
            this._coverDiv.appendChild(coverText)
            document.body.appendChild(this._coverDiv)
        }

        const urlParams = Utils.getUrlParams()
        const rowId = urlParams.get('id') ?? undefined
        let rowItem = await DataBaseHelper.loadById(rowId)
        if(rowItem) {
            this._state.groupKey = rowItem.key
            this._state.groupClass = rowItem.class
        }
        if(urlParams.has('k')) this._state.groupKey = decodeURIComponent(urlParams.get('k') ?? '')
        if(urlParams.has('c')) this._state.groupClass = decodeURIComponent(urlParams.get('c') ?? '')
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

        // When a child editor is spawned we ask to create a new item so the editor will show up.
        const createNew = urlParams.has('n')
            ? !!urlParams.get('n')
            : false
        if(this._state.minimal && createNew) {
            let defaultKey = ''
            const config = await DataBaseHelper.loadMain(new ConfigEditor(), true)
            if(config.autoGenerateKeys) {
                const nextKey = await DataBaseHelper.getNextKey(this._state.groupClass, this._state.parentId, config.autoGenerateKeys_andShorten)
                if(nextKey) defaultKey = nextKey.key ?? ''
            }
            const newKey = await prompt(`Provide a new key for this ${this._state.groupClass}:`, defaultKey)
            if(newKey && newKey.length > 0) {
                const instance = await DataObjectMap.getInstance(this._state.groupClass)
                if(instance) {
                    const didSave = await DataBaseHelper.save(instance, newKey, undefined, this._state.parentId)
                    if(didSave) {
                        this._state.groupKey = newKey
                    } else {
                        alert(`Unable to save new ${this._state.groupClass} entry.`)
                        window.close()
                        return
                    }
                }
            } else {
                window.close()
                return
            }
        }

        this.updateSideMenu().then()
        if(this._state.groupClass.length > 0) this.buildEditorControls(
            this._state.groupClass,
            this._state.groupKey,
            this._state.parentId
        ).then()

        window.onkeydown = (event)=>{
            if(event.key == 's' && event.ctrlKey) {
                if(event.cancelable) event.preventDefault()
                this._editorSaveButton?.click()
            }
            if(event.key == 'Delete' && event.shiftKey) {
                if(event.cancelable) event.preventDefault()
                this._editorDeleteButton?.click()
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
    private _editorDeleteButton: HTMLButtonElement|undefined
    private async buildEditorControls(
        group: string,
        selectKey: string = '',
        parentId?: number,
    ) {
        await this.confirmSaveIfReplacingOrLeaving()
        this._state.groupClass = group
        this._state.groupKey = selectKey

        Utils.setUrlParam({c: group})

        if(!this._contentDiv) {
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
        }

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group, EUtilsTitleReturnOption.SkipFirstWord)

        // Description
        const description = document.createElement('p') as HTMLParagraphElement
        const descriptionText = DataObjectMap.getMeta(group)?.description ?? 'No description.'
        description.innerHTML = this.linkifyDescription(descriptionText)

        // Dropdown & editor
        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        this._editor = new JsonEditor()
        this._editor.setModifiedStatusListener(this.updateModifiedState.bind(this))
        this._editor.setChildEditorLaunchedListener(this.childEditorLaunched.bind(this))

        const dropdown = document.createElement('select') as HTMLSelectElement
        const dropdownLabel = document.createElement('label') as HTMLLabelElement
        const updateEditor = async(
            event: Event|undefined, // Here so we can assign it to listeners
            newKey: string = ''
        ): Promise<boolean> =>{
            await this.confirmSaveIfReplacingOrLeaving()
            let instance: BaseDataObject|undefined
            const resultingKey = newKey.length > 0
                ? newKey
                : this._state.forceMainKey
                    ? DataBaseHelper.OBJECT_MAIN_KEY
                    : dropdown.value
            if(resultingKey.length > 0) {
                const item = (items as IDataBaseItem<any>[]).find(item => item.key == resultingKey)
                instance = await DataObjectMap.getInstance(group, item?.data ?? {}) ?? item?.data ?? {} // The last ?? is for test settings that has no class.
            } else {
                instance = await DataObjectMap.getInstance(group, {})
            }
            editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
            editorDeleteButton.innerHTML = this._state.forceMainKey
                ? this._labelDeleteResetButton
                : this._state.minimal
                    ? this._labelDeleteAndCloseButton
                    : this._labelDeleteButton
            if(instance && instance?.constructor.name !== 'Object') {
                // Update URL to enable refreshes and bookmarks.
                Utils.setUrlParam({
                    c: group,
                    k: resultingKey
                })

                this._state.groupKey = resultingKey
                let item = await DataBaseHelper.loadItem(instance, resultingKey)

                if(this._state.forceMainKey && !item) {
                    const didSave = await DataBaseHelper.save(instance, resultingKey)
                    if(didSave) {
                        item = await DataBaseHelper.loadItem(instance, resultingKey)
                        await this.updateSideMenu()
                    } else {
                        alert('Unable to initialize config.')
                        return false
                    }
                }

                editorContainer.replaceChildren(
                    await this._editor?.build(
                        resultingKey,
                        instance, 
                        item?.id,
                        !!parentId ? parentId : item?.pid ?? undefined,
                        this._state.forceMainKey
                    ) ?? ''
                )
                editorDeleteButton.classList.remove('hidden')
                editorSaveButton.classList.remove('hidden')
            } else {
                console.warn(`Could not load instance for ${group}, class is: ${instance?.constructor.name}`)
            }
            return true
        }

        const items = await DataBaseHelper.loadJson(group, undefined, parentId)
        if(this._state.forceMainKey) {
            dropdown.style.display = 'none'
            dropdownLabel.style.display = 'none'
        } else {
            dropdown.id = 'dropdown'
            dropdownLabel.htmlFor = dropdown.id
            dropdownLabel.innerText = 'Entries: '
            const keyMap = DataObjectMap.getMeta(group)?.keyMap
            if(keyMap) dropdown.title = 'Key labels are mapped, the actual key is in the editor.'
            if(this._contentDiv && items) {
                for(const item of items) {
                    const mappedKey = keyMap?.[item.key]
                    const option = document.createElement('option') as HTMLOptionElement
                    option.innerText = mappedKey ?? item.key
                    if(mappedKey) option.title = `Key label mapped from: ${item.key}`
                    option.value = item.key
                    if(selectKey == item.key) option.selected = true
                    dropdown.appendChild(option)
                }
            }
            dropdown.onclose = updateEditor
            dropdown.onchange = updateEditor
        }

        // New button
        const editorNewButton = document.createElement('button') as HTMLButtonElement
        editorNewButton.classList.add('main-button', 'new-button')
        editorNewButton.innerHTML = '✨ New'
        editorNewButton.title = 'And new entry'
        editorNewButton.onclick = async (event)=>{
            let newKey: string = ''
            if(this._state.forceMainKey) {
                newKey = DataBaseHelper.OBJECT_MAIN_KEY
            } else {
                newKey = await prompt(`Provide a key for the new ${group}:`) ?? ''
            }
            if(newKey && newKey.length > 0) {
                await updateEditor(undefined, newKey)
                await this.saveData(group, newKey, parentId)
            }
        }

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('main-button', 'delete-button', 'hidden')
        editorDeleteButton.style.marginRight = '10em'
        editorDeleteButton.innerHTML = this._state.minimal ? this._labelDeleteAndCloseButton : this._labelDeleteButton
        editorDeleteButton.tabIndex = -1
        editorDeleteButton.onclick = async(event)=>{
            if(!this._state.groupKey) { // Cancel
                if(this._state.minimal) {
                    window.opener.postMessage(NaN)
                    window.close()
                }
            } else { // Delete
                const verb = this._state.forceMainKey ? 'reset' : 'delete'
                const doDelete = confirm(`Do you want to ${verb} ${group} : ${this._state.groupKey}?`)
                if(doDelete) {
                    const ok = await DataBaseHelper.deleteJson(group, this._state.groupKey)
                    if(ok) {
                        DataBaseHelper.clearReferences(group) // To make reference lists reload to remove the deleted entry.
                        this.updateSideMenu().then()
                        this.buildEditorControls(group, '', this._state.parentId).then()
                        if(this._state.minimal) {
                            window.opener.postMessage(0)
                            window.close()
                        }
                    } else {
                        alert(`Deletion of ${group} : ${this._state.groupKey} failed.`)
                    }
                }
            }
        }
        this._editorDeleteButton = editorDeleteButton

        // Save button
        const editorSaveButton = document.createElement('button') as HTMLButtonElement
        editorSaveButton.classList.add('main-button', 'save-button', 'hidden')
        editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
        editorSaveButton.onclick = async (event)=>{
            const newKey = await this.saveData(group, this._state.groupKey, this._state.parentId)
            const json = await DataBaseHelper.loadJson(this._state.groupClass, newKey ?? this._state.groupKey, this._state.parentId)
            if(this._state.minimal) {
                const id = json.pop()?.id ?? ''
                window.opener.postMessage(id)
                window.close()
            }
        }
        this._editorSaveButton = editorSaveButton

        // Export button
        const editorExportButton = document.createElement('button') as HTMLButtonElement
        editorExportButton.classList.add('main-button', 'export-button')
        editorExportButton.innerHTML = '📤 Export'
        editorExportButton.title = 'Export current editor data as JSON to the system clipboard.'
        editorExportButton.onclick = async (event)=>{
            const result = await Utils.writeToClipboard(this._editor?.getData())
            if(!result) alert('Unable to export, clipboard was not updated.')
        }

        // Import button
        const editorImportButton = document.createElement('button') as HTMLButtonElement
        editorImportButton.classList.add('main-button', 'import-button')
        editorImportButton.innerHTML = '📥 Import'
        editorImportButton.title = 'Import the current system clipboard JSON data into the editor.'
        editorImportButton.onclick = async (event)=>{
            const result = await Utils.readFromClipboard(true)
            if(!result) alert('Unable to import, clipboard unavailable or contains invalid JSON data.')
            else this._editor?.setData(result)
        }

        const hasAnyItems = dropdown.children.length > 0
        if(hasAnyItems || this._state.forceMainKey) {
            await updateEditor(undefined)
        }
        this._contentDiv.replaceChildren(title)
        this._contentDiv.appendChild(description)
        if(!this._state.minimal) {
            if(dropdownLabel) this._contentDiv.appendChild(dropdownLabel)
            this._contentDiv.appendChild(dropdown)
            if(!this._state.forceMainKey) this._contentDiv.appendChild(editorNewButton)
        }
        if(hasAnyItems) this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorSaveButton)
        if(hasAnyItems || this._state.forceMainKey) {
            this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
            this._contentDiv.appendChild(editorExportButton)
            this._contentDiv.appendChild(editorImportButton)
        }
    }

    private async saveData(groupClass: string, groupKey: string, parentId?: number): Promise<string|null> {
        if(this._editor) {
            const data = this._editor.getData()
            const newGroupKey = this._editor.getKey()
            const resultingGroupKey = await DataBaseHelper.saveJson(JSON.stringify(data), groupClass, groupKey, newGroupKey, parentId)
            if(resultingGroupKey) {
                if(newGroupKey) DataBaseHelper.clearReferences(groupClass) // To make reference lists reload with the new/updated item.
                await this.updateSideMenu()
                this.updateModifiedState(false)
                await this.buildEditorControls(groupClass, resultingGroupKey, this._state.parentId)
                return resultingGroupKey
            } else {
                alert(`Failed to save ${groupClass}:${groupKey}|${newGroupKey}`)
            }
        }
        return null
    }

    private updateModifiedState(modified: boolean) {
        this._unsavedChanges = Utils.clone(modified)
        if(modified) {
            window.onbeforeunload = async (event)=>{
                await this.confirmSaveIfReplacingOrLeaving()
                return undefined
            }
        } else {
            window.onbeforeunload = null
        }
    }

    private async confirmSaveIfReplacingOrLeaving(): Promise<boolean> {
        if(this._unsavedChanges) {
            // This is ignored if we are called by onbeforeunload, it manages staying on the page with browser features.
            const shouldSave = confirm('There are still unsaved changes, do you want to save?')
            if(shouldSave) {
                const resultKey = await this.saveData(this._state.groupClass, this._state.groupKey, this._state.parentId)
                return resultKey !== null
            }
        }
        return false
    }

    private _childEditorWindow: Window|null = null
    private childEditorLaunched(window: Window|null) {
        this._childEditorWindow = window
        this.toggleCover(true)
    }

    private async childEditorResult(id: number) {
        const obj = await DataBaseHelper.loadById(id)
        if(obj) DataBaseHelper.clearReferences(obj.class)
        this._editor?.gotChildEditorResult(id)
    }

    // private _childPathToSet:
    private toggleCover(state: boolean) {
        if(state) {
            window.onmessage = (event)=>{
                this.toggleCover(false)
                if(typeof event.data == 'number') {
                    this.childEditorResult(event.data).then()
                }
            }
            if(this._containerDiv) this._containerDiv.style.filter = 'blur(10px)'
            if(this._coverDiv) this._coverDiv.style.display = 'flex'
        } else {
            window.onmessage = null
            if(this._containerDiv) this._containerDiv.style.filter = ''
            if(this._coverDiv) this._coverDiv.style.display = 'none'
        }
    }

    private linkifyDescription(descriptionText: string) {
        const re = /(https?:\/\/\S*)\w/ig
        let text = descriptionText.replace(re, (str)=>{
            const label = str.split('//').pop()
            return `<a href="${str}" target="_blank">${label ?? str}</a>`
        })
        return text.replace(/\n/g, '<br/>')
    }
}

class EditorPageState {
    group: string = ''
    likeFilter: string = ''
    forceMainKey: boolean = false
    groupClass: string = ''
    groupKey: string = ''
    parentId: number = 0
    minimal: boolean = false
}