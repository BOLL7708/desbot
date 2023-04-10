import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import BaseDataObject, {EmptyDataObject, IBaseDataObjectRefValues,} from '../../Objects/BaseDataObject.js'
import DataBaseHelper, {IDataBaseListItems} from '../../Classes/DataBaseHelper.js'
import DataObjectMap from '../../Objects/DataObjectMap.js'
import {EnumObjectMap} from '../../Objects/EnumObjectMap.js'
import {BaseMeta} from '../../Objects/BaseMeta.js'
import {ConfigEditor} from '../../Objects/Config/Editor.js'

enum EOrigin {
    Unknown,
    ListArray,
    ListDictionary,
    Single
}

export interface IStepDataOptions {
    root: HTMLElement
    data: string|number|boolean|object
    instanceMeta: BaseMeta|undefined
    path: IJsonEditorPath
    key: string|undefined
    origin: EOrigin
    originListCount: number
    extraChildren: HTMLElement[]
}

export default class JsonEditor {
    private _key: string = ''
    private _originalKey: string = ''
    private _instance: object&BaseDataObject = new EmptyDataObject()
    private _originalInstance: object&BaseDataObject = new EmptyDataObject()
    private _originalInstanceType: string|undefined
    private _root: HTMLUListElement|undefined = undefined
    private _labels: HTMLSpanElement[] = []
    private _hideKey: boolean = false
    private _dirty: boolean = false
    private _rowId: number = 0
    private _parentId: number = 0
    private _config: ConfigEditor = new ConfigEditor()

    private readonly MODIFIED_CLASS = 'modified'

    private _modifiedStatusListener: IJsonEditorModifiedStatusListener = (modified)=>{}
    setModifiedStatusListener(listener: IJsonEditorModifiedStatusListener) {
        this._modifiedStatusListener = listener
    }
    private _childEditorLaunchedListener: IChildEditorLaunchedListener = (window)=>{}
    setChildEditorLaunchedListener(listener: IChildEditorLaunchedListener) {
        this._childEditorLaunchedListener = listener
    }

    constructor() {}

    async build(
        key: string,
        instance: object&BaseDataObject,
        rowId?: number,
        parentId?: number,
        hideKey?: boolean,
        isRebuild?: boolean
    ): Promise<HTMLElement> {
        if(!isRebuild) {
            this._key = key
            this._originalKey = key
            this._hideKey = !!hideKey
            this._rowId = rowId ?? 0
            this._parentId = parentId ?? 0
            if(instance) {
                this._instance = await instance.__clone()
                this._originalInstance = await instance.__clone();
            }
            this._originalInstanceType = instance.constructor.name
            this._config = await DataBaseHelper.loadMain(new ConfigEditor(), true)
        }

        this._labels = []
        const instanceMeta = DataObjectMap.getMeta(this._originalInstanceType ?? '')
        const tempParent = this.buildUL()

        // region Extra Children
        const extraChildren: HTMLElement[] = []

        // ID field
        if(!this._config.hideIDs) {
            if(this._rowId > 0) {
                extraChildren.push(
                    ...this.buildInfo('ID',
                        this._rowId.toString(),
                        'If an ID is shown, the data has been saved.',
                        'The ID of this row in the database.'
                    )
                )
            }
            if(this._rowId > 0 && this._parentId > 0) {
                const spaceSpan = document.createElement('span') as HTMLSpanElement
                spaceSpan.innerHTML = '⇒ '
                extraChildren.push(spaceSpan)
            }
        }

        // Parent ID field
        if(this._parentId > 0) {
            if(!this._config.hideIDs) extraChildren.push(
                ...this.buildInfo('Parent ID', this._parentId.toString(),
                    'If a parent ID is shown, this data belongs to a different row.',
                    'The ID of the parent row in the database.'
                )
            )
            const urlParams = Utils.getUrlParams()
            if(!urlParams.get('m')) { // m as in Minimal
                const parentButton = document.createElement('button') as HTMLButtonElement
                parentButton.innerHTML = '👴'
                parentButton.title = 'Edit the parent item.'
                parentButton.classList.add('inline-button')
                parentButton.onclick = (event) => {
                    window.location.replace(`?id=${this._parentId}`)
                }
                extraChildren.push(parentButton)
            }
        }
        // region

        const options: IStepDataOptions = {
            root: tempParent,
            data: instance,
            instanceMeta: instanceMeta,
            path: ['Key'],
            key: key,
            origin: EOrigin.Unknown,
            originListCount: 1,
            extraChildren: extraChildren
        }
        await this.stepData(options)

        if(!this._root) this._root = this.buildUL()
        this._root.replaceChildren(...tempParent.children)
        return this._root
    }
    private async rebuild(): Promise<HTMLElement> {
        return await this.build(
            this._key,
            this._instance,
            this._rowId,
            this._parentId,
            this._hideKey,
            true
        )
    }

    private async stepData(options: IStepDataOptions):Promise<void> {
        const type = typeof options.data
        switch(type) {
            case 'string':
                await this.buildField(EJsonEditorFieldType.String, options)
                break
            case 'number':
                await this.buildField(EJsonEditorFieldType.Number, options)
                break
            case 'boolean':
                await this.buildField(EJsonEditorFieldType.Boolean, options)
                break
            case 'object': // Instances
                if(options.data === null) {
                    // Exist to show that something is broken as we don't support the null type.
                    await this.buildField(EJsonEditorFieldType.Null, options)
                } else {
                    await this.buildFields(options)
                }
                break
            case 'function': // Enum
                const optionsClone = Utils.clone(options)
                optionsClone.root = options.root
                optionsClone.extraChildren = options.extraChildren
                optionsClone.data = 0
                await this.buildField(EJsonEditorFieldType.Number, optionsClone)
                break
            default:
                console.warn('Unhandled data type: ', type,', data: ', options.data)
        }
        return
    }

    private buildUL(): HTMLUListElement {
        return document.createElement('ul') as HTMLUListElement
    }
    private buildLI(html: string|HTMLElement[]): HTMLLIElement {
        const li = document.createElement('li') as HTMLLIElement
        if(Array.isArray(html)) {
            li.replaceChildren(...html)
        } else {
            li.innerHTML = html
        }
        return li
    }
    private buildInfo(labelStr: string, valueStr: string, labelTitle: string = '', valueTitle = ''): HTMLElement[] {
        const label = document.createElement('span')
        label.classList.add('input-label')
        label.innerHTML = `${labelStr}: `
        label.title = labelTitle
        const field = document.createElement('code')
        field.classList.add('disabled')
        field.contentEditable = 'false'
        field.innerHTML = valueStr
        field.title = valueTitle
        return [label, field]
    }

    private async buildField(
        type: EJsonEditorFieldType,
        options: IStepDataOptions
    ): Promise<void> {
        const key = options.path[options.path.length-1] ?? ''
        const previousKey = options.path[options.path.length-2] ?? ''
        const pathStr = options.path.join('.')
        const isRoot = options.path.length == 1

        // Sort out type values for ID references
        const thisType = options.instanceMeta?.types ? options.instanceMeta.types[key] ?? '' : ''
        const thisTypeValues = BaseDataObject.parseRef(thisType)
        const parentType = options.instanceMeta?.types ? options.instanceMeta.types[previousKey] ?? '' : ''
        const parentTypeValues = BaseDataObject.parseRef(parentType)

        // Root element
        let newRoot = document.createElement('li') as HTMLElement

        const [partnerKey, labelStr] = Utils.splitOnFirst('_', key.toString())
        let isPartnerField = false
        if(key.toString().includes('_') && partnerKey.length > 0) {
            const partnerId = this.getPartnerSlotID(this._instance.constructor.name, partnerKey)
            const partnerSlot = options.root.querySelector(`#${partnerId}`) as HTMLElement
            if(partnerSlot) {
                isPartnerField = true
                newRoot = partnerSlot
            }
        }

        // Label
        let keyInput: HTMLSpanElement|undefined
        const label: HTMLSpanElement = document.createElement('span') as HTMLSpanElement
        if(options.origin == EOrigin.ListDictionary) {
            label.innerHTML = ' : '
            keyInput = document.createElement('code') as HTMLSpanElement
            keyInput.contentEditable = 'false'
            keyInput.innerHTML = key.toString()
        } else {
            label.innerHTML = isRoot
                ? `<strong>${key}</strong>: `
                : options.origin == EOrigin.ListArray
                    ? `Item ${Utils.ensureNumber(key)+1}: `
                    : `${isPartnerField ? ' '+Utils.nameToSentence(labelStr) : Utils.camelToTitle(key.toString())}: `
            label.onclick = (event)=>{
                input.click()
                input.focus()
            }
        }
        label.classList.add('input-label')
        this._labels.push(label)
        this.handleValue(options.data, options.path, label ,true) // Will colorize label

        // Append
        if(options.originListCount > 1) {
            this.appendDragButton(newRoot, options.origin, options.path)
        }
        if(keyInput) {
            // Optional editable key
            newRoot.appendChild(keyInput)
        }
        newRoot.appendChild(label)

        // Input
        let skip = false
        let handle = (event: Event) => {}
        let input: HTMLSpanElement = document.createElement('code') as HTMLSpanElement
        input.onpaste = (event)=>{
            event.preventDefault()
            let text = event.clipboardData?.getData('text/plain') ?? ''
            switch(type) {
                case EJsonEditorFieldType.String:
                    text = text.replace(/\n/g, '\\n').replace(/\r/g, '')
                    break
                case EJsonEditorFieldType.Number:
                    let num = parseFloat(text)
                    if(isNaN(num)) num = 0
                    if(input.innerHTML.indexOf('.') > -1) {
                        num = Math.round(num)
                    }
                    text = `${num}`
                    break
            }
            document.execCommand('insertText', false, text) // No good substitute yet.
        }

        switch (type) {
            case EJsonEditorFieldType.String:
                input.contentEditable = 'true'
                input.innerHTML = Utils.escapeHTML(`${options.data}`)
                input.onkeydown = (event)=>{
                    if (event.key === 'Enter') {
                        event.preventDefault()
                    }
                }
                handle = (event) => {
                    this.handleValue(Utils.unescapeHTML(input.innerHTML), options.path, label)
                }
                break
            case EJsonEditorFieldType.Boolean:
                const on = this._config.hideBooleanNames ? '✅' : '✅ True'
                const off = this._config.hideBooleanNames ? '❌' : '❌ False'
                input.style.userSelect = 'none'
                input.tabIndex = 0
                input.innerHTML = (options.data as boolean) ? on : off
                input.classList.add('boolean-input')
                label.onclick = input.onclick = input.onkeydown = (event: KeyboardEvent|MouseEvent)=>{
                    if(event instanceof KeyboardEvent) {
                        const validKeys = [' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
                        if(validKeys.indexOf(event.key) == -1) return console.log(`"${key}"`)
                    }
                    input.innerHTML = (input.innerHTML == on) ? off : on
                    this.handleValue(input.innerHTML == on, options.path, label)
                }
                handle = (event) => {}
                break
            case EJsonEditorFieldType.Number:
                input.contentEditable = 'true'
                input.innerHTML = `${options.data}`
                input.onkeydown = (event)=>{
                    const validKeys = ['Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'ArrowLeft', 'Tab']
                    const key = event.key
                    const isDigit = !isNaN(parseInt(key))
                    const isValidPeriod = key == '.' && input.innerHTML.indexOf('.') == -1
                    const isValidKey = validKeys.indexOf(key) != -1
                    const isHoldingModifierKey = event.altKey || event.shiftKey || event.ctrlKey
                    if (
                        !isDigit
                        && !isValidPeriod
                        && !isValidKey
                        && !isHoldingModifierKey
                    ) {
                        event.preventDefault()
                    }
                }
                handle = (event)=>{
                    const num = parseFloat(input.innerHTML)
                    this.handleValue(isNaN(num) ? 0 : num, options.path, label)
                }
                break
            case EJsonEditorFieldType.Null:
                input.innerHTML = 'NULL'
                break
            default:
                skip = true
        }

        if(keyInput) {
            keyInput.onclick = (event)=>{
                this.promptForKey(options.path)
            }
        }

        if(!skip) {
            if(isRoot && this._hideKey) {
                input.contentEditable = 'false'
                input.classList.add('disabled')
                input.onclick = ()=>{}
            }
            input.id = pathStr
            input.oninput = handle

            newRoot.appendChild(input)
        }

        /*
         * An Enum class will have a select showing all the valid options.
         */
        if(thisTypeValues.enum || parentTypeValues.enum) {
            input.contentEditable = 'false'
            input.classList.add('disabled')
            if(this._config.hideIDs) input.classList.add('hidden')
            const enumClass = thisTypeValues.enum
                ? thisTypeValues.class // Single enum
                : parentTypeValues.class  // List of enums
            const enumPrototype = EnumObjectMap.getPrototype(enumClass)
            const enumMeta = EnumObjectMap.getMeta(enumClass)
            if(enumMeta && enumPrototype) {
                const enumSelect = document.createElement('select') as HTMLSelectElement
                for(const [enumKey,enumValue] of Object.entries(enumPrototype)) {
                    const option = document.createElement('option') as HTMLOptionElement
                    option.value = enumValue
                    option.innerHTML = enumKey
                    if(enumMeta.documentation?.hasOwnProperty(enumKey)) option.title = enumMeta.documentation[enumKey]
                    if(enumValue == Utils.ensureNumber(options.data)) {
                        option.selected = true
                    }
                    enumSelect.appendChild(option)
                }
                enumSelect.oninput = (event) => {
                    input.innerHTML = enumSelect.value
                    handle(event)
                }
                newRoot.appendChild(enumSelect)
            }
        }
        /*
         * This is where we differentiate on if we are referencing something by ID
         * We support both this item being that, or the parent, depending on if it's
         * a single item we are referencing, or an appendable array.
         */
        if(thisTypeValues.isIdReference || parentTypeValues.isIdReference) {
            const values = thisTypeValues.isIdReference ? thisTypeValues : parentTypeValues
            const isGeneric = values.genericLike.length > 0
            input.contentEditable = 'false'
            input.classList.add('disabled')
            if(this._config.hideIDs) input.classList.add('hidden')

            // Select with IDs
            const selectIDs = document.createElement('select') as HTMLSelectElement

            // Fill select with IDs with options
            const buildSelectOfIDs = async(overrideClass: string = '') => {
                const idStr = options.data.toString()
                let items: IDataBaseListItems = {}
                if(overrideClass.length > 0) {
                    items = await DataBaseHelper.loadIDsWithLabelForClass(overrideClass, undefined, isGeneric ? this._rowId : undefined)
                } else {
                    items = await DataBaseHelper.loadIDsWithLabelForClass(values.class, values.idLabelField, isGeneric ? this._rowId : undefined)
                }
                if(!this._config.includeOrphansInGenericLists) {
                    items = Object.fromEntries(
                        // Filter on if parent is not null, or the ID matches the current value.
                        Object.entries(items).filter( ([k,v]) => v.pid !== null || k.toString() === idStr )
                    )
                }
                let hasSetInitialValue = false
                let firstValue = '0'
                items['0'] = {key: '', label: '- empty -', pid: null}
                selectIDs.replaceChildren()
                for(const [itemId, item] of Object.entries(items ?? {}).sort(([k1,v1], [k2, v2])=>{
                    const a = Utils.getFirstValidString(v1.label, v1.key, k1)
                    const b = Utils.getFirstValidString(v2.label, v2.key, k2)
                    return a.localeCompare(b)
                })) {
                    const option = document.createElement('option') as HTMLOptionElement
                    if(!parseInt(itemId)) option.style.color = 'darkgray'
                    option.value = itemId
                    option.innerHTML = Utils.getFirstValidString(item.label, item.key, itemId)
                    option.title = item.key
                    if(itemId.toString() == idStr) {
                        firstValue = itemId
                        option.selected = true
                        input.innerHTML = itemId.toString()
                        hasSetInitialValue = true
                    }
                    selectIDs.add(option)
                }
                if(!hasSetInitialValue) input.innerHTML = firstValue
                selectIDs.oninput = (event) => {
                    input.innerHTML = selectIDs.value
                    handle(event)
                }
            }

            // Generics need an additional list of classes, this is that.
            const selectGeneric = document.createElement('select') as HTMLSelectElement
            if(isGeneric) {
                newRoot.appendChild(selectGeneric)
                const setNewReference = this.appendNewReferenceItemButton(newRoot, values, options.path, this._rowId) // Button after items in groups of generic references
                const items = DataObjectMap.getNames(values.genericLike, true)
                const genericClasses = await DataBaseHelper.loadIDClasses([options.data.toString()])
                const genericClass = genericClasses[options.data.toString()] ?? ''
                let isNewReferenceItemButtonInitialized = false
                for(const clazz of items) {
                    if(!isNewReferenceItemButtonInitialized) {
                        // We need to do this or generic lists will have the super class as class to instantiate.
                        setNewReference(clazz)
                        isNewReferenceItemButtonInitialized = true
                    }
                    if(clazz) {
                        const option = document.createElement('option') as HTMLOptionElement
                        option.innerHTML = Utils.camelToTitle(clazz, EUtilsTitleReturnOption.SkipFirstWord)
                        const meta = DataObjectMap.getMeta(clazz)
                        option.title = `${clazz} : ${meta?.description ?? 'No description.'}`
                        option.value = clazz
                        if(genericClass == clazz) { // Make selected if a match
                            option.selected = true
                            setNewReference(clazz)
                        }
                        selectGeneric.add(option)
                    }
                }
                if(items.length <= 1) {
                    selectGeneric.title = 'Only one type is available so the selector is disabled.'
                    selectGeneric.disabled = true
                }
                selectGeneric.oninput = (event) => {
                    const clazz = selectGeneric.value
                    setNewReference(clazz)
                    buildSelectOfIDs(clazz)
                }
            }

            // List of ID references and edit button.
            const editButton = document.createElement('button') as HTMLButtonElement
            const dataBaseItem = await DataBaseHelper.loadById(selectIDs.value)
            editButton.innerHTML = '📝'
            editButton.title = 'Edit the referenced item.'
            editButton.classList.add('inline-button')
            editButton.onclick = (event)=>{
                if(selectIDs.value !== '0') {
                    let link = `editor.php?m=1&id=${selectIDs.value}`
                    if(isGeneric && dataBaseItem?.pid) link += `&p=${dataBaseItem.pid}`
                    this.openChildEditor(link,
                        thisTypeValues.isIdReference || parentTypeValues.isIdReference ? options.path : []
                    )
                }
            }
            newRoot.appendChild(selectIDs)
            newRoot.appendChild(editButton)
            if(values.genericLike) {
                await buildSelectOfIDs(selectGeneric.value)
            } else {
                await buildSelectOfIDs()
            }
        }

        // Append partner field slot
        this.appendPartnerFieldSlot(newRoot, this._instance.constructor.name, key.toString())

        // Append buttons and icons
        if(thisTypeValues.isIdReference && thisTypeValues.genericLike.length == 0) {
            this.appendNewReferenceItemButton(newRoot, thisTypeValues, options.path) // The button that goes onto single non-generic reference items.
        }
        this.appendRemoveButton(newRoot, options.origin, options.path, label)
        this.appendDocumentationIcon(newRoot, key, options.instanceMeta)
        if(options.extraChildren.length > 0) for(const child of options.extraChildren) newRoot.appendChild(child)

        // Append to parent
        if(!isPartnerField) options.root.appendChild(newRoot)
        return
    }

    private async promptForKey(path: IJsonEditorPath) {
        const oldKey = Utils.clone(path).pop() ?? ''
        const newKey = prompt(`Provide a new key for "${path.join('.')}:"`, oldKey.toString())
        if(newKey && newKey.length > 0) {
            await this.handleKey(Utils.unescapeHTML(newKey), path)
        }
    }

    private async buildFields(
        options: IStepDataOptions
    ): Promise<void> {
        const pathKey = options.path[options.path.length-1] ?? 'root'
        const newRoot = this.buildLI('')
        const newUL = this.buildUL()
        const instance = (options.data as object)
        const isRoot = options.path.length == 1

        // Sort out type values for ID references
        const thisType = options.instanceMeta?.types ? options.instanceMeta.types[pathKey] ?? '' : ''
        const thisTypeValues = BaseDataObject.parseRef(thisType)
        const instanceType = instance.constructor.name

        if(options.originListCount > 1) this.appendDragButton(newRoot, options.origin, options.path)

        if(isRoot) { // Root object generates a key field
            const optionsClone = Utils.clone(options)
            optionsClone.root = options.root
            optionsClone.extraChildren = options.extraChildren
            optionsClone.data = `${options.key ?? ''}`
            optionsClone.origin = EOrigin.Single
            await this.buildField(EJsonEditorFieldType.String, optionsClone)
        } else {
            // A dictionary has editable keys
            if(options.origin == EOrigin.ListDictionary) {
                const keyInput = document.createElement('code') as HTMLSpanElement
                keyInput.contentEditable = 'false'
                keyInput.innerHTML = pathKey.toString()
                keyInput.onclick = (event)=>{
                    this.promptForKey(options.path)
                }
                newRoot.appendChild(keyInput)
            }
            // An array has a fixed index
            else {
                const strongSpan = document.createElement('strong') as HTMLSpanElement
                strongSpan.innerHTML = options.origin == EOrigin.ListArray
                    ? `Item ${Utils.ensureNumber(pathKey)+1}`
                    : Utils.camelToTitle(pathKey.toString())
                if(thisTypeValues.class) strongSpan.title = `Type: ${thisTypeValues.class}`
                newRoot.appendChild(strongSpan)
            }
        }

        // Append partner field slot
        if(!isRoot) this.appendPartnerFieldSlot(newRoot, this._instance.constructor.name, pathKey.toString())

        // Add new item button if we have a type defined
        await this.appendAddButton(newRoot, thisTypeValues, instance, options.path)
        this.appendRemoveButton(newRoot, options.origin, options.path, undefined)
        if(thisTypeValues.genericLike.length == 0) {
            this.appendNewReferenceItemButton(newRoot, thisTypeValues, []) // The new button for groups of generic reference items
        }
        this.appendDocumentationIcon(newRoot, pathKey, options.instanceMeta)

        // Get new instance meta if we are going deeper.
        let newInstanceMeta = options.instanceMeta
        if(thisType && DataObjectMap.hasInstance(thisType)) { // For lists class instances
            newInstanceMeta = DataObjectMap.getMeta(thisType) ?? options.instanceMeta
        } else if (instanceType && DataObjectMap.hasInstance(instanceType)) { // For single class instances
            newInstanceMeta = DataObjectMap.getMeta(instanceType) ?? options.instanceMeta
        }
        const newOptions: IStepDataOptions = {
            root: newUL,
            data: 0,
            instanceMeta: newInstanceMeta,
            path: [],
            key: undefined,
            origin: EOrigin.Unknown,
            originListCount: 1,
            extraChildren: []
        }
        if(Array.isArray(instance)) {
            newOptions.origin = thisType ? EOrigin.ListArray : EOrigin.Single
            for(let i=0; i<instance.length; i++) {
                const optionsClone = Utils.clone(newOptions)
                optionsClone.root = newOptions.root
                optionsClone.extraChildren = newOptions.extraChildren
                optionsClone.data = instance[i]
                optionsClone.path = this.clone(options.path)
                optionsClone.path.push(i)
                optionsClone.originListCount = instance.length
                await this.stepData(optionsClone)
            }
        } else {
            newOptions.origin = thisType ? EOrigin.ListDictionary : EOrigin.Single
            for(const key of Object.keys(instance)) {
                const optionsClone = Utils.clone(newOptions)
                optionsClone.root = newOptions.root
                optionsClone.extraChildren = newOptions.extraChildren
                optionsClone.path = this.clone(options.path)
                optionsClone.path.push(key.toString())
                optionsClone.data = (instance as any)[key.toString()]
                optionsClone.originListCount = Object.keys(instance).length
                await this.stepData(optionsClone)
            }
        }
        newRoot.appendChild(newUL)
        options.root.appendChild(newRoot)
        return
    }
    // region Buttons
    private appendDragButton(element: HTMLElement, origin: EOrigin, path: (string | number)[]) {
        if(origin == EOrigin.ListArray || origin == EOrigin.ListDictionary) {
            const span = document.createElement('span') as HTMLSpanElement
            span.innerHTML = '🤚'
            span.title = 'Drag & drop in list'
            span.classList.add('drag-icon')
            span.draggable = true
            span.ondragstart = (event)=>{
                span.style.cursor = 'grabbing'
                if(event.dataTransfer) {
                    event.dataTransfer.setData('application/json', JSON.stringify(path))
                    event.dataTransfer.effectAllowed = 'move'
                }
            }
            span.ondragenter = (event)=>{
                if(event.dataTransfer) event.dataTransfer.dropEffect = 'move'
            }
            span.ondragover = (event)=>{
                event.preventDefault() // Apparently we need to do this to allow for the drop to happen.
            }
            span.ondragend = (event)=>{
                span.style.cursor = 'grabbing'
            }
            span.ondrop = async (event)=>{
                const data = event.dataTransfer?.getData('application/json')
                if(data) {
                    const fromPath = JSON.parse(data) as IJsonEditorPath
                    if(origin == EOrigin.ListArray) {
                        await this.handleArrayMove(fromPath, path)
                    } else if(origin == EOrigin.ListDictionary) {
                        await this.handleDictionaryMove(fromPath, path)
                    }
                }
            }
            element.appendChild(span)
        }
    }

    private appendPartnerFieldSlot(element: HTMLElement, clazz: string, key: string) {
        const partnerSlot = document.createElement('span') as HTMLSpanElement
        partnerSlot.id = this.getPartnerSlotID(clazz, key)
        element.appendChild(partnerSlot)
    }

    /**
     * Adds the button but also returns a lambda that can update the link of the button to lead to a different class.
     * @param element
     * @param typeValues
     * @param path // Only include the path if the item is supposed to be replaced with the new one.
     * @param parentId // Add parent IDs for generic items that should belong to a single parent.
     * @private
     */
    private appendNewReferenceItemButton(element: HTMLElement, typeValues: IBaseDataObjectRefValues, path: IJsonEditorPath, parentId?: number): Function {
        let button: HTMLButtonElement|undefined = undefined
        const updateLink = (clazz: string)=>{
            if(button) {
                button.title = `Create new item of type: ${clazz}`+(parentId ? ` for parent: ${this._key} (${parentId})` : '')
                button.onclick = (event)=>{
                    let link = `editor.php?c=${clazz}&m=1&n=1`
                    if(parentId) link += `&p=${parentId}`
                    this.openChildEditor(link, path)
                }
            }
        }
        if(typeValues.class && typeValues.isIdReference) {
            button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '👶'
            button.classList.add('inline-button')
            button.tabIndex = -1
            updateLink(typeValues.class)
            element.appendChild(button)
        }
        return updateLink
    }

    private appendRemoveButton(element: HTMLElement, origin: EOrigin, path: IJsonEditorPath, label: HTMLElement|undefined) {
        if(origin == EOrigin.ListArray || origin == EOrigin.ListDictionary) {
            const button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '💥'
            button.title = 'Remove item'
            button.classList.add('inline-button', 'delete-button')
            button.tabIndex = -1
            button.onclick = async (event)=>{
                this.handleValue(null,  path, label)
                await this.rebuild()
            }
            element.appendChild(button)
        }
    }

    private appendDocumentationIcon(element: HTMLElement, keyValue: string|number, instanceMeta: BaseMeta|undefined) {
        const key = keyValue.toString()
        const docStr = (instanceMeta?.documentation ?? {})[key] ?? ''
        if(docStr.length > 0 && this._config.showHelpIcons) {
            const span = document.createElement('span') as HTMLSpanElement
            span.classList.add('documentation-icon')
            span.innerHTML = '💬'
            span.title = docStr
            element.appendChild(span)
        }
    }
    // endregion

    private clone<T>(value: T): T {
        return JSON.parse(JSON.stringify(value)) as T
    }

    /**
     *
     * @param value A value to set, check, or remove. Null will remove.
     * @param path Path to the value in the structure.
     * @param label The HTML element to colorize to indicate if the value changed.
     * @param onlyCheckModified Will not set, only check and color label.
     * @private
     */
    private handleValue(
        value: string|number|boolean|object|null,
        path: IJsonEditorPath,
        label: HTMLElement|undefined = undefined,
        onlyCheckModified: boolean = false
    ) {
        // console.log("Handle value: ", value, path, new Error().stack?.toString())
        let current: any = this._instance
        let currentOriginal: any = this._originalInstance
        if(path.length == 1) {
            if(value == this._originalKey) {
                // Same as original value
                if(label) label.classList.remove(this.MODIFIED_CLASS)
            } else {
                // New value
                this._key = `${value}`
                if(label) label.classList.add(this.MODIFIED_CLASS)
            }
        } else {
            for(let i = 1; i<path.length; i++) {
                // Will remove the value from the JSON structure
                if(value === null && i == path.length-1) {
                    const p = path[i]
                    if(Array.isArray(current) && typeof p == 'number') {
                        (current as []).splice(p, 1)
                    } else {
                        delete current[p]
                    }
                    return
                }

                // If we're on the last depth, act on it
                const currentOriginalValue = currentOriginal && currentOriginal.hasOwnProperty(path[i]) ? currentOriginal[path[i]] : undefined
                if(i == path.length-1) {
                    // Not same as the stored one, or just checked if modified
                    if(current[path[i]] != value || onlyCheckModified) {
                        if(!onlyCheckModified) current[path[i]] = value // Actual update in the JSON structure
                        let newPropertyIndex = false
                        if(
                            typeof current == 'object'
                            && !Array.isArray(current)
                            && typeof currentOriginal == 'object'
                            && !Array.isArray(currentOriginal)
                        ) {
                            newPropertyIndex = Object.keys(current).indexOf(path[i].toString())
                                !== Object.keys(currentOriginal).indexOf(path[i].toString())
                        }
                        // ? current.indexOf(path[i]) != currentOriginal.indexOf(path[i])
                        // : false
                        if(currentOriginalValue == value && !newPropertyIndex) {
                            // Same as original value
                            if(label) label.classList.remove(this.MODIFIED_CLASS)
                        } else {
                            // New value
                            if(label) label.classList.add(this.MODIFIED_CLASS)
                        }
                    }
                } else {
                    // Continue to navigate down into the data structure
                    current = current[path[i]]
                    currentOriginal = currentOriginalValue
                }
            }
        }
        this.checkIfModified()
    }

    private async handleArrayMove(
        fromPath: IJsonEditorPath,
        toPath: IJsonEditorPath
    ) {
        let fromIndex = fromPath[fromPath.length-1]
        if(typeof fromIndex === 'string') fromIndex = parseInt(fromIndex)
        let toIndex = toPath[toPath.length-1]
        if(typeof toIndex === 'string') toIndex = parseInt(toIndex)
        let current: any = this._instance
        for (let i = 1; i < fromPath.length; i++) {
            // Will change the order of an array
            if (i == fromPath.length - 2) {
                const p = fromPath[i]
                const contents = Utils.clone(current[p])
                if(Array.isArray(contents)) {
                    Utils.moveInArray(contents, fromIndex, toIndex)
                }
                current[p] = contents
                await this.rebuild()
            } else {
                // Continue to navigate down into the data structure
                current = current[fromPath[i]]
            }
        }
        this.checkIfModified()
    }

    private async handleDictionaryMove(
        fromPath: IJsonEditorPath,
        toPath: IJsonEditorPath
    ) {
        let fromProperty = fromPath[fromPath.length-1]
        let toProperty = toPath[toPath.length-1]
        console.log(fromProperty, toProperty)
        let current: any = this._instance
        for (let i = 1; i < fromPath.length; i++) {
            // Will change the order of an array
            if (i == fromPath.length - 2) {
                const p = fromPath[i]
                let contents = Utils.clone(current[p])
                console.log(Object.keys(contents))
                if(typeof contents == 'object') {
                    contents = Utils.moveInDictionary(contents, fromProperty.toString(), toProperty.toString())
                }
                console.log(Object.keys(contents))
                current[p] = contents
                await this.rebuild()
            } else {
                // Continue to navigate down into the data structure
                current = current[fromPath[i]]
            }
        }
        this.checkIfModified()
    }

    private async handleKey(
        keyValue: string,
        path: IJsonEditorPath,
    ) {
        let current: any = this._instance
        for (let i = 1; i < path.length; i++) {
            // Will change the key for a property
            if (i == path.length - 1) {
                const p = path[i]
                const contents = Utils.clone(current[p])
                delete current[p]
                current[keyValue] = contents
                await this.rebuild()
            } else {
                // Continue to navigate down into the data structure
                current = current[path[i]]
            }
        }
        this.checkIfModified()
    }

    /**
     * Will check if the data or key has been modified, and run the listener if the state has changed.
     */
    checkIfModified() {
        const dirty =
            JSON.stringify(this._instance) != JSON.stringify(this._originalInstance)
            || this._key != this._originalKey
        if(dirty != this._dirty) {
            this._modifiedStatusListener(dirty)
            this._dirty = dirty
        }
    }

    getData(): any {
        return this._instance
    }
    async setData(data: any) {
        const freshInstance = await DataObjectMap.getInstance(this._originalInstanceType, data)
        if(freshInstance) {
            this._instance = freshInstance
            await this.rebuild()
        } else {
            alert('Unable to import as there is no reference class in memory. This should not really happen.')
        }
    }
    getKey(): string {
        return this._key
    }

    private async appendAddButton(newRoot: HTMLLIElement, typeValues: IBaseDataObjectRefValues, instance: object, path: IJsonEditorPath) {
        if(typeValues.class.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = async (event)=>{
                if(Array.isArray(instance)) {
                    switch(typeValues.original) {
                        case 'number': instance.push(0); break
                        case 'boolean': instance.push(false); break
                        case 'string': instance.push(''); break
                        default:
                            if(typeValues.isIdReference) {
                                instance.push(0)
                                break
                            }
                            if(DataObjectMap.hasInstance(typeValues.class)) {
                                const newInstance = await DataObjectMap.getInstance(typeValues.class, undefined)
                                if(newInstance) instance.push(await newInstance.__clone()) // For some reason this would do nothing unless cloned.
                            } else if(EnumObjectMap.hasPrototype(typeValues.class)) {
                                const enumPrototype = await EnumObjectMap.getPrototype(typeValues.class)
                                if(enumPrototype) instance.push(enumPrototype)
                            }
                            else console.warn('Unhandled type:', typeValues.class)
                    }
                    this.handleValue(instance, path, newRoot)
                    await this.rebuild()
                } else {
                    const newKey = prompt(`Provide a key for the new ${typeValues.class}:`)
                    if(newKey && newKey.length > 0) {
                        switch(typeValues.original) {
                            case 'number': (instance as any)[newKey] = 0; break
                            case 'boolean': (instance as any)[newKey] = false; break
                            case 'string': (instance as any)[newKey] = ''; break
                            default:
                                if(typeValues.isIdReference) {
                                    (instance as any)[newKey] = 0
                                    break
                                }
                                if(DataObjectMap.hasInstance(typeValues.class)) {
                                    const newInstance = await DataObjectMap.getInstance(typeValues.class, undefined)
                                    if(newInstance) (instance as any)[newKey] = await newInstance.__clone()
                                } else if(EnumObjectMap.hasPrototype(typeValues.class)) {
                                    const enumPrototype = EnumObjectMap.getPrototype(typeValues.class)
                                    if(enumPrototype) (instance as any)[newKey] = enumPrototype
                                }
                                else console.warn('Unhandled type:', typeValues.class)
                        }
                        this.handleValue(instance, path, newRoot)
                        await this.rebuild()
                    }
                }
            }
            newRoot.appendChild(newButton)
        }
    }

    private _childEditorPath: IJsonEditorPath = []
    private openChildEditor(url: string, path: IJsonEditorPath) {
        this._childEditorPath = path
        const childEditorWindow = window.open(url)
        this._childEditorLaunchedListener(childEditorWindow)
    }

    gotChildEditorResult(id: number): boolean {
        if(this._childEditorPath.length > 0) {
            this.handleValue(id, this._childEditorPath)
            this._childEditorPath = []
            this.rebuild().then()
            return true
        } else {
            this.rebuild().then()
            return false
        }
    }

    private getPartnerSlotID(partnerClass: string, key: string | number) {
        return `editorPartnerSlot-${partnerClass}-${key}`
    }
}
enum EJsonEditorFieldType {
    String,
    Boolean,
    Number,
    Null
}

interface IJsonEditorPath extends Array<string|number> {}

interface IJsonEditorModifiedStatusListener {
    (modified: boolean): void
}
interface IChildEditorLaunchedListener {
    (window: Window|null): void
}