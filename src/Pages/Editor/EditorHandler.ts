import DataBaseHelper, {IDataBaseItem} from '../../Classes/DataBaseHelper.js'
import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import JsonEditor from './JsonEditor.js'
import Data from '../../Objects/Data.js'
import DataMap, {IRootTool} from '../../Objects/DataMap.js'
import {ConfigEditor} from '../../Objects/Config/ConfigEditor.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import EnlistData from '../../Objects/EnlistData.js'
import {EventDefault} from '../../Objects/Event/EventDefault.js'
import EditorHandlerUtils from './EditorHandlerUtils.js'
import {PresetEventCategory} from '../../Objects/Preset/PresetEventCategory.js'
import {DataUtils} from '../../Objects/DataUtils.js'
import Constants from '../../Classes/Constants.js'

export default class EditorHandler {
    private _state = new EditorPageState()

    private readonly _labelDeleteButton: string = '💥 Delete (shift+del)'
    private readonly _labelDeleteAndCloseButton: string = '💥 Delete & close (shift+del)'
    private readonly _labelDeleteResetButton: string = '💥 Reset (shift+del)'
    private readonly _labelDefaultsButton: string = '📕 Defaults'
    private readonly _labelCancelButton: string = '🧹 Cancel'
    private readonly _labelSaveButton: string = '💾 Save (ctrl+s)'
    private readonly _labelSaveAndCloseButton: string = '💾 Save & close (ctrl+s)'
    private _unsavedChanges: boolean = false

    public constructor() {
        this.init().then()
    }

    private _containerDiv: HTMLDivElement|undefined
    private _coverDiv: HTMLDivElement|undefined

    private async init() {
        EnlistData.run()
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
        if(urlParams.has('pp')) this._state.potentialParentId = parseInt(urlParams.get('pp') ?? '')
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
            const newKey = await prompt(`Provide an explanatory name (key) for this ${this._state.groupClass}:`, defaultKey)
            if(newKey && newKey.length > 0) {
                const instance = await DataMap.getInstance({ className: this._state.groupClass, fill: false })
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

        if(!this._contentDiv) { // Needed as we can add a button to the content div in updateSideMenu() to support single-group side menus that shows items.
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
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
    private _eventCategory = Number.MIN_VALUE
    async updateSideMenu(skipNewButton: boolean = false) {
        const config = await DataBaseHelper.loadMain(new ConfigEditor())

        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        if(!this._sideMenuDiv) return // Side menu does not exist in minimal mode.

        if(this._eventCategory == Number.MIN_VALUE) {
            this._eventCategory = parseInt(localStorage.getItem(Constants.LOCAL_STORAGE_KEY_EVENTCATEGORY+Utils.getCurrentFolder()) ?? '0')
        }

        // Clear
        this._sideMenuDiv.replaceChildren()

        // Add title
        const title = document.createElement('h3') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(this._state.likeFilter, EUtilsTitleReturnOption.OnlyFirstWord) + ' Entries'
        this._sideMenuDiv.appendChild(title)

        // Load data, fill in missing classes if we have a filter.
        let classesAndCounts = await DataBaseHelper.loadClassesWithCounts(this._state.likeFilter)
        for(const className of DataMap.getNames(this._state.likeFilter)) {
            if(!classesAndCounts.hasOwnProperty(className)) {
                // Add missing classes so they can still be edited
                classesAndCounts[className] = 0
            }
        }
        let isItems = false
        let itemClass = ''
        let isListingEvents = false
        if(Object.keys(classesAndCounts).length == 1) {
            const className = Object.keys(classesAndCounts)[0]
            const eventCategories = await DataBaseHelper.loadAll(new PresetEventCategory()) ?? {}
            // If a data category only has one type of items, we will list that in the side menu directly, right now just Events.
            const meta = DataMap.getMeta(className)
            const categorySelector = document.createElement('select')
            if(meta) {
                // If we are listing events, do the following.
                isListingEvents = className == EventDefault.ref.build()
                if(isListingEvents) {
                    // Add optional category selector
                    const typeContainer = document.createElement('p')
                    const typeSelectorId = className + '-type-selector'
                    const typeLabel = document.createElement('label')
                    typeLabel.innerText = 'Category: '
                    typeLabel.htmlFor = typeSelectorId
                    typeContainer.appendChild(typeLabel)

                    categorySelector.id = typeSelectorId
                    const options = Object.entries(eventCategories).map(([key, preset])=>{
                        const option = document.createElement('option')
                        option.value = preset.id.toString()
                        option.innerText = Utils.camelToTitle(key)
                        option.title = preset.data?.description ?? ''
                        if(preset.id == this._eventCategory) option.selected = true
                        return option
                    })
                    // Add extra options
                    const optionAll = document.createElement('option')
                    optionAll.value = '0'
                    optionAll.innerText = 'All'
                    if(optionAll.value == this._eventCategory.toString()) optionAll.selected = true
                    const optionUncategorized = document.createElement('option')
                    optionUncategorized.value = '-1'
                    optionUncategorized.innerText = 'Uncategorized'
                    if(optionUncategorized.value == this._eventCategory.toString()) optionUncategorized.selected = true
                    options.push(optionAll, optionUncategorized)

                    categorySelector.replaceChildren(...options)
                    categorySelector.onchange = (event)=>{
                        this._eventCategory = Number(categorySelector.value)
                        localStorage.setItem(Constants.LOCAL_STORAGE_KEY_EVENTCATEGORY+Utils.getCurrentFolder(), this._eventCategory.toString())
                        this.updateSideMenu(true).then()
                    }
                    typeContainer.appendChild(categorySelector)
                    this._sideMenuDiv.appendChild(typeContainer)
                }
                itemClass = className
                const items = await DataBaseHelper.loadAll(meta.instance)
                if(items) {
                    isItems = true
                    let unfiltered = true
                    if(isListingEvents) {
                        if(this._eventCategory > 0) {
                            // Show events that match the chosen category
                            classesAndCounts = Object.fromEntries(
                                Object.entries(items).filter(([key, item])=>{
                                        const eventItem = item.data as EventDefault
                                        return eventItem.category == this._eventCategory
                                }).map(([key, value])=>{
                                    return [key, 1]
                                })
                            )
                            unfiltered = false
                        } else if(this._eventCategory == -1) {
                            // Show uncategorized events
                            const eventCategoryIds = Object.values(eventCategories).map((item)=>{
                                return item.id
                            })
                            classesAndCounts = Object.fromEntries(
                                Object.entries(items).filter(([key, item])=>{
                                    const eventItem = item.data as EventDefault
                                    return !eventCategoryIds.includes(DataUtils.ensureID(eventItem.category) ?? Number.MAX_VALUE)
                                }).map(([key, value])=>{
                                    return [key, 1]
                                })
                            )
                            unfiltered = false
                        }
                    }
                    if(unfiltered) {
                        // Show all items
                        classesAndCounts = Object.fromEntries(Object.entries(items).map(([key, value])=>{
                            return [key, 1]
                        }))
                    }

                    // Add new-button to contents.
                    if(!skipNewButton) {
                        const newButton = EditorHandlerUtils.getNewButton()
                        newButton.onclick = async(event)=>{
                            const newKey = await prompt(`Provide a key for the new ${itemClass}:`) ?? ''
                            if(newKey && newKey.length > 0) {
                                const exists = await DataBaseHelper.load(meta.instance, newKey)
                                if(!exists) {
                                    // Only save a new item if it does not already exist, to prevent overwriting data.
                                    await DataBaseHelper.save(meta.instance, newKey)
                                }
                                this.buildEditorControls(
                                    itemClass,
                                    newKey
                                ).then()
                            }
                        }
                        this._contentDiv?.appendChild(newButton)
                    } else {
                        categorySelector.focus()
                    }
                }
            }
        }

        for(const [group, count] of Object.entries(classesAndCounts).sort()) {
            const link = document.createElement('span') as HTMLSpanElement
            const a = document.createElement('a') as HTMLAnchorElement
            a.href = '#'
            if(isItems) { // Actually specific items as there is only one group
                let name = Utils.camelToTitle(group)

                // TODO: Should probably break out the Event menu into a separate function as it is so different from the other menus...
                // Emoji tags added to name
                if(isListingEvents && config.displayEmojisForEvents) {
                    // Sort classes by order, TODO: This can probably be avoided by changing the DataBaseHelper.loadIDClasses() to not sort the entries, check that later.
                    function restoreOrderOfClasses(entries: [string, string][], order: number[]): string[] {
                        entries.sort((a, b)=>{
                            return order.indexOf(parseInt(a[0])) - order.indexOf(parseInt(b[0]))
                        })
                        return entries.map((entry)=>{
                            return entry[1]
                        })
                    }
                    const item = await DataBaseHelper.load(new EventDefault(), group)

                    // Triggers
                    const triggerIDs = DataUtils.ensureIDArray(item?.triggers ?? [])
                    const triggerValues = await DataBaseHelper.loadIDClasses(triggerIDs)
                    const triggerClasses = [...new Set(restoreOrderOfClasses(Object.entries(triggerValues), triggerIDs))]

                    // Actions
                    const actionIDs: number[] = []
                    for(const actionContainer of (item?.actions ?? [])) {
                        actionIDs.push(...DataUtils.ensureIDArray(actionContainer.entries) ?? [])
                    }
                    const actionValues = await DataBaseHelper.loadIDClasses(actionIDs)
                    const actionClasses = [...new Set(restoreOrderOfClasses(Object.entries(actionValues), actionIDs))]

                    // Add to name
                    name = `${DataMap.getTags(triggerClasses)} ${name} ${DataMap.getTags(actionClasses)}`.trim()
                    const titleTriggers = triggerClasses.map((item)=>{
                        return item.replace(/^Trigger/, '')
                    }).join(', ')
                    const titleActions = actionClasses.map((item)=>{
                        return item.replace(/^Action/, '')
                    }).join(', ')
                    a.title = `Triggers: ${titleTriggers}\nActions: ${titleActions}`
                }

                a.innerHTML = name
                a.onclick = (event: Event) => {
                    if(event.cancelable) event.preventDefault()
                    this.buildEditorControls(itemClass, group).then()
                }
            } else { // Multiple groups (most common behavior)
                const name = Utils.camelToTitle(group, EUtilsTitleReturnOption.SkipFirstWord)

                // To hide counts on the Config page which starts at 0 until people view it, as it got confusing.
                if(group.startsWith('Config') && count <= 1) a.innerHTML = name
                else a.innerHTML = `${name}: <strong>${count}</strong>`

                a.onclick = (event: Event) => {
                    if(event.cancelable) event.preventDefault()
                    this.buildEditorControls(group).then()
                }
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
        const meta = DataMap.getMeta(group)

        Utils.setUrlParam({c: group})

        if(!this._contentDiv) {
            this._contentDiv = document.querySelector('#content') as HTMLDivElement
        }

        // Title
        const title = document.createElement('h2') as HTMLHeadingElement
        title.innerHTML = Utils.camelToTitle(group, EUtilsTitleReturnOption.SkipFirstWord)

        // Description
        const description = document.createElement('p') as HTMLParagraphElement
        const descriptionText = meta?.description ?? 'No description.'
        description.innerHTML = this.linkifyDescription(descriptionText)

        // Dropdown & editor
        const editorContainer = document.createElement('div') as HTMLDivElement
        editorContainer.id = 'editor-container'
        this._editor = new JsonEditor()
        this._editor.setModifiedStatusListener(this.updateModifiedState.bind(this))
        this._editor.setChildEditorLaunchedListener(this.childEditorLaunched.bind(this))

        const dropdown = document.createElement('select') as HTMLSelectElement
        const dropdownLabel = document.createElement('label') as HTMLLabelElement

        // Tools
        const buttonBar = document.createElement('div') as HTMLDivElement
        for(const task of meta?.tasks ?? []) {
            const taskButton = buildToolOrTaskButton(this._editor, task)
            buttonBar.appendChild(taskButton)
        }
        for(const [key, tool] of Object.entries(meta?.tools ?? {})) {
            const toolButton = buildToolOrTaskButton(this._editor, tool, key)
            buttonBar.appendChild(toolButton)
        }
        function buildToolOrTaskButton(editor: JsonEditor, call: IRootTool, key?: string) {
            const button = document.createElement('button') as HTMLButtonElement
            button.classList.add('main-button')
            button.innerHTML = call.label
            button.title = call.documentation
            button.onclick = async()=>{
                if(editor && meta) {
                    const data = editor.getData()
                    const newInstance = await meta.instance.__new(data?.instance ?? {}, call.filledInstance)
                    if(newInstance) {
                        const response = await call.callback(newInstance)
                        if(response.message) alert(response.message)
                        if(response.success && key) {
                            editor.setValue([JsonEditor.PATH_ROOT_KEY, key], response.data)
                        }
                    }
                }
            }
            return button
        }

        const updateEditor = async(
            event: Event|undefined, // Here so we can assign it to listeners
            newKey: string = ''
        ): Promise<boolean> =>{
            await this.confirmSaveIfReplacingOrLeaving()
            let instance: Data|undefined

            // Figure out what key we are using.
            const resultingKey = newKey.length > 0
                ? newKey
                : this._state.forceMainKey
                    ? DataBaseHelper.OBJECT_MAIN_KEY
                    : dropdown.value

            // Convert JSON data to an actual class instance, so we can save it back to the DB with the class retained.
            if(resultingKey.length > 0) {
                const jsonItem = (jsonItems as IDataBaseItem<any>[]).find(item => item.key == resultingKey)
                instance = await DataMap.getInstance({ className: group, props: jsonItem?.data ?? {}, fill: false }) ?? jsonItem?.data ?? {} // The last ?? is for test settings that has no class.
            } else {
                instance = await DataMap.getInstance({ className: group, fill: false })
            }

            // Update buttons
            editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
            editorDeleteButton.innerHTML = this._state.forceMainKey
                ? this._labelDeleteResetButton // Config
                : this._state.minimal
                    ? this._labelDeleteAndCloseButton // Child editor
                    : this._labelDeleteButton // All other items

            // If we have an actual Data instance, load it into the editor.
            if(instance && instance?.constructor.name !== 'Object') {
                // Update URL to enable refreshes and bookmarks.
                Utils.setUrlParam({
                    c: group,
                    k: resultingKey
                })

                // Load item just to make sure we have the latest data as we got the JSON from the original items.
                this._state.groupKey = resultingKey
                let item = await DataBaseHelper.loadItem(instance, resultingKey, undefined, true)

                // If we didn't get any item but we have a key, we will pre-initialize it.
                if(resultingKey && !item) {
                    const didSave = await DataBaseHelper.save(instance, resultingKey)
                    if(didSave) {
                        item = await DataBaseHelper.loadItem(instance, resultingKey, undefined, true)
                        await this.updateSideMenu()
                    } else {
                        alert('Unable to initialize config.')
                        return false
                    }
                }
                if(item) {
                    editorContainer.replaceChildren(
                        await this._editor?.build(
                            item,
                            this._state.potentialParentId,
                            this._state.forceMainKey
                        ) ?? ''
                    )
                } else {
                    console.warn(`Could not load item for ${group} : ${resultingKey}`)
                }
                editorDeleteButton.classList.remove('hidden')
                editorDefaultsButton.classList.remove('hidden')
                editorCancelButton.classList.remove('hidden')
                editorSaveButton.classList.remove('hidden')
            } else {
                console.warn(`Could not load instance for ${group}, class is: ${instance?.constructor.name}`)
            }
            return true
        }

        const jsonItems = await DataBaseHelper.loadJson(group, undefined, parentId)
        if(this._state.forceMainKey) {
            dropdown.style.display = 'none'
            dropdownLabel.style.display = 'none'
        } else {
            dropdown.id = 'dropdown'
            dropdownLabel.htmlFor = dropdown.id
            dropdownLabel.innerText = 'Entries: '
            const keyMap = DataMap.getMeta(group)?.keyMap
            if(keyMap) dropdown.title = 'Key labels are mapped, the actual key is in the editor.'
            if(this._contentDiv && jsonItems) {
                for(const jsonItem of jsonItems) {
                    const mappedKey = keyMap?.[jsonItem.key]
                    const option = document.createElement('option') as HTMLOptionElement
                    option.innerText = mappedKey ?? jsonItem.key
                    if(mappedKey) option.title = `Key label mapped from: ${jsonItem.key}`
                    option.value = jsonItem.key
                    if(selectKey == jsonItem.key) option.selected = true
                    dropdown.appendChild(option)
                }
            }
            dropdown.onclose = updateEditor
            dropdown.onchange = updateEditor
        }

        // New button
        const editorNewButton = EditorHandlerUtils.getNewButton()
        editorNewButton.onclick = async (event)=>{
            let newKey: string = ''
            if(this._state.forceMainKey) {
                newKey = DataBaseHelper.OBJECT_MAIN_KEY
            } else {
                newKey = await prompt(`Provide a key for the new ${group}:`) ?? ''
            }
            if(newKey && newKey.length > 0) {
                // Update editor with empty data, this means it will create it if it does not exist, else change to it.
                await updateEditor(undefined, newKey)
            }
        }

        // Delete button
        const editorDeleteButton = document.createElement('button') as HTMLButtonElement
        editorDeleteButton.classList.add('main-button', 'delete-button', 'hidden')
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

        // Defaults button
        const editorDefaultsButton = document.createElement('button') as HTMLButtonElement
        editorDefaultsButton.classList.add('main-button', 'hidden')
        editorDefaultsButton.innerHTML = this._labelDefaultsButton
        editorDefaultsButton.onclick = async (event)=>{
            const ok = confirm('Do you want to reset to defaults?')
            if(ok) this._editor?.setData(undefined)
        }

        // Cancel button
        const editorCancelButton = document.createElement('button') as HTMLButtonElement
        editorCancelButton.classList.add('main-button', 'hidden')
        editorCancelButton.innerHTML = this._labelCancelButton
        editorCancelButton.onclick = (event)=>{
            const ok = confirm('Do you want to cancel current changes?')
            if(ok) this._editor?.setData(this._editor?.getOriginalData(), true)
        }

        // Save button
        const editorSaveButton = document.createElement('button') as HTMLButtonElement
        editorSaveButton.classList.add('main-button', 'save-button', 'hidden')
        editorSaveButton.innerHTML = this._state.minimal ? this._labelSaveAndCloseButton : this._labelSaveButton
        editorSaveButton.onclick = async (event)=>{
            const newKey = await this.saveData(group, this._state.groupKey)
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
            const data = (result.hasOwnProperty('instance') && result.hasOwnProperty('parentId')) ? result.instance : result
            this._editor?.setData(data)
        }

        const hasAnyItems = dropdown.children.length > 0
        if(hasAnyItems || this._state.forceMainKey) {
            await updateEditor(undefined)
        }
        this._contentDiv.replaceChildren(title)
        this._contentDiv.appendChild(description)
        this._contentDiv.appendChild(buttonBar)
        if(!this._state.minimal) {
            if(dropdownLabel) this._contentDiv.appendChild(dropdownLabel)
            this._contentDiv.appendChild(dropdown)
            if(!this._state.forceMainKey) this._contentDiv.appendChild(editorNewButton)
        }
        if(hasAnyItems) this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
        this._contentDiv.appendChild(editorContainer)
        this._contentDiv.appendChild(editorDeleteButton)
        this._contentDiv.appendChild(editorDefaultsButton)
        this._contentDiv.appendChild(editorCancelButton)
        this._contentDiv.appendChild(editorSaveButton)
        if(hasAnyItems || this._state.forceMainKey) {
            this._contentDiv.appendChild(document.createElement('hr') as HTMLHRElement)
            this._contentDiv.appendChild(editorExportButton)
            this._contentDiv.appendChild(editorImportButton)
        }
    }

    private async saveData(groupClass: string, groupKey: string): Promise<string|null> {
        if(this._editor) {
            const editorData = this._editor.getData()
            const newGroupKey = this._editor.getKey()
            const resultingGroupKey = await DataBaseHelper.saveJson(JSON.stringify(editorData.instance), groupClass, groupKey, newGroupKey, editorData.parentId)
            if(resultingGroupKey) {
                if(newGroupKey) DataBaseHelper.clearReferences(groupClass) // To make reference lists reload with the new/updated item.
                this._state.parentId = editorData.parentId
                await this.updateSideMenu()
                this.updateModifiedState(false)
                await this.buildEditorControls(groupClass, resultingGroupKey, this._state.parentId)
                return resultingGroupKey
            } else {
                alert(`Failed to save ${groupClass}:${groupKey}|${newGroupKey}`)
            }
        } else {
            console.warn('No editor to save data from.')
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
                const resultKey = await this.saveData(this._state.groupClass, this._state.groupKey)
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
    potentialParentId: number = 0
    parentId: number = 0
    minimal: boolean = false
}