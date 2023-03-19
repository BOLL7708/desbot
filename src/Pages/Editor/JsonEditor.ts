import Utils from '../../Classes/Utils.js'
import BaseDataObject, {EmptyDataObject, IBaseDataObjectRefValues,} from '../../Objects/BaseDataObject.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataObjectMap, {DataObjectMeta} from '../../Objects/DataObjectMap.js'
import {IStringDictionary} from '../../Interfaces/igeneral.js'
import {EnumObjectMap} from '../../Objects/EnumObjectMap.js'
import {BaseMeta} from '../../Objects/BaseMeta.js'

enum EOrigin {
    Unknown,
    ListArray,
    ListDictionary,
    Single
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

    private readonly _labelUnchangedColor = 'transparent'
    private readonly _labelChangedColor = 'pink'

    private _modifiedStatusListener: IJsonEditorModifiedStatusListener = (modified:boolean)=>{}
    setModifiedStatusListener(listener: IJsonEditorModifiedStatusListener) {
        this._modifiedStatusListener = listener
    }

    constructor() {}

    async build(
        key: string,
        instance: object&BaseDataObject,
        rowId?: number,
        parentId?: number,
        dirty?: boolean,
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
        }
        this._modifiedStatusListener(!!dirty)

        this._labels = []
        const instanceMeta = DataObjectMap.getMeta(this._originalInstanceType ?? '')
        const tempParent = this.buildUL()

        const firstRowChildren: HTMLElement[] = []
        if(this._rowId > 0) firstRowChildren.push(...this.buildInfo('ID', this._rowId.toString()))
        if(this._rowId > 0 && this._parentId > 0) {
            const spaceSpan = document.createElement('span') as HTMLSpanElement
            spaceSpan.innerHTML = ' ⇒ '
            firstRowChildren.push(spaceSpan)
        }
        if(this._parentId > 0) {
            firstRowChildren.push(...this.buildInfo('Parent ID', this._parentId.toString()))
            const parentButton = document.createElement('button') as HTMLButtonElement
            parentButton.innerHTML = '📝'
            parentButton.title = 'Edit the parent item.'
            parentButton.classList.add('inline-button')
            parentButton.onclick = (event)=>{
                window.location.replace(`?id=${this._parentId}`)
            }
            firstRowChildren.push(parentButton)
        }
        const firstRowLI = this.buildLI(firstRowChildren)
        tempParent.replaceChildren(firstRowLI)

        await this.stepData(tempParent, instance, instanceMeta, ['Key'], key, EOrigin.Unknown)

        if(!this._root) this._root = this.buildUL()
        this._root.replaceChildren(...tempParent.children)
        if(dirty) this.highlightLabels()
        return this._root
    }
    private async rebuild(): Promise<HTMLElement> {
        return await this.build(
            this._key,
            this._instance,
            this._rowId,
            this._parentId,
            false,
            this._hideKey,
            true
        )
    }

    private highlightLabels() {
        for(const label of this._labels) {
            label.style.backgroundColor = this._labelChangedColor
        }
    }

    private async stepData(
        root: HTMLElement,
        data: string|number|boolean|object,
        instanceMeta: BaseMeta|undefined,
        path: IJsonEditorPath,
        key: string|undefined = undefined,
        origin: EOrigin = EOrigin.Unknown,
        originListCount: number = 1
    ):Promise<void> {
        const type = typeof data
        switch(type) {
            case 'string':
                await this.buildField(root, EJsonEditorFieldType.String, data, instanceMeta, path, origin, originListCount)
                break
            case 'number':
                await this.buildField(root, EJsonEditorFieldType.Number, data, instanceMeta, path, origin, originListCount)
                break
            case 'boolean':
                await this.buildField(root, EJsonEditorFieldType.Boolean, data, instanceMeta, path, origin, originListCount)
                break
            case 'object': // Instances
                if(data === null) {
                    // Exist to show that something is broken as we don't support the null type.
                    await this.buildField(root, EJsonEditorFieldType.Null, data, instanceMeta, path, origin, originListCount)
                } else {
                    await this.buildFields(root, data as object, instanceMeta, path, key, origin, originListCount)
                }
                break
            case 'function': // Enum
                console.log('StepData Function', data, instanceMeta, path, origin, originListCount)
                await this.buildField(root, EJsonEditorFieldType.Number, 0, instanceMeta, path, origin, originListCount)
                break
            default:
                console.warn('Unhandled data type: ', type,', data: ', data)
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
    private buildInfo(label: string, value: string): HTMLElement[] {
        const idLabel = document.createElement('span')
        idLabel.classList.add('input-label')
        idLabel.innerHTML = `${label}: `
        const idField = document.createElement('code')
        idField.classList.add('disabled')
        idField.contentEditable = 'false'
        idField.innerHTML = value
        return [idLabel, idField]
    }

    private async buildField(
        root: HTMLElement,
        type: EJsonEditorFieldType,
        value: string|number|boolean|object,
        instanceMeta: BaseMeta|undefined,
        path: IJsonEditorPath,
        origin: EOrigin,
        originListCount: number = 1
    ): Promise<void> {
        const key = path[path.length-1] ?? ''
        const previousKey = path[path.length-2] ?? ''
        const pathStr = path.join('.')
        const isRoot = path.length == 1

        // Sort out type values for ID references
        const thisType = instanceMeta?.types ? instanceMeta.types[key] ?? '' : ''
        const thisTypeValues = BaseDataObject.parseRef(thisType)
        const parentType = instanceMeta?.types ? instanceMeta.types[previousKey] ?? '' : ''
        const parentTypeValues = BaseDataObject.parseRef(parentType)

        // Label
        let keyInput: HTMLSpanElement|undefined
        const label: HTMLSpanElement = document.createElement('span') as HTMLSpanElement
        if(origin == EOrigin.ListDictionary) {
            label.innerHTML = ' : '
            keyInput = document.createElement('code') as HTMLSpanElement
            keyInput.contentEditable = 'false'
            keyInput.innerHTML = key.toString()
        } else {
            label.innerHTML = isRoot
                ? `<strong>${key}</strong>: `
                : origin == EOrigin.ListArray
                    ? `${key}: `
                    : `${Utils.camelToTitle(key.toString())}: `
            label.onclick = (event)=>{
                input.click()
                input.focus()
            }
        }
        label.classList.add('input-label')
        this._labels.push(label)
        this.handleValue(value, path, label ,true) // Will colorize label

        const li = document.createElement('li') as HTMLLIElement
        if(originListCount > 1) this.appendDragButton(li, origin, path)
        if(keyInput) {
            // Optional editable key
            li.appendChild(keyInput)
        }

        // Item
        li.appendChild(label)

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
                input.innerHTML = Utils.escapeHTML(`${value}`)
                input.onkeydown = (event)=>{
                    if (event.key === 'Enter') {
                        event.preventDefault()
                    }
                }
                handle = (event) => {
                    this.handleValue(Utils.unescapeHTML(input.innerHTML), path, label)
                }
                break
            case EJsonEditorFieldType.Boolean:
                const on = '✅ True'
                const off = '❌ False'
                input.style.userSelect = 'none'
                input.tabIndex = 0
                input.innerHTML = (value as boolean) ? on : off
                input.classList.add('boolean-input')
                label.onclick = input.onclick = input.onkeydown = (event: KeyboardEvent|MouseEvent)=>{
                    if(event instanceof KeyboardEvent) {
                        const validKeys = [' ', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
                        if(validKeys.indexOf(event.key) == -1) return console.log(`"${key}"`)
                    }
                    input.innerHTML = (input.innerHTML == on) ? off : on
                    this.handleValue(input.innerHTML == on, path, label)
                }
                handle = (event) => {}
                break
            case EJsonEditorFieldType.Number:
                input.contentEditable = 'true'
                input.innerHTML = `${value}`
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
                    this.handleValue(isNaN(num) ? 0 : num, path, label)
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
                this.promptForKey(path)
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

            li.appendChild(input)
        }

        /*
         * An Enum class will have a select showing all the valid options.
         */
        if(thisTypeValues.enum || parentTypeValues.enum) {
            input.contentEditable = 'false'
            input.classList.add('disabled')
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
                    if(enumValue == Utils.ensureNumber(value)) {
                        option.selected = true
                    }
                    enumSelect.appendChild(option)
                }
                enumSelect.oninput = (event) => {
                    input.innerHTML = enumSelect.value
                    handle(event)
                }
                li.appendChild(enumSelect)
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

            // Select with IDs
            const selectIDs = document.createElement('select') as HTMLSelectElement

            // Fill select with IDs with options
            const buildSelectOfIDs = async(overrideClass: string = '') => {
                let items: IStringDictionary = {}
                if(overrideClass.length > 0) {
                    items = await DataBaseHelper.loadIDsWithLabelForClass(overrideClass, undefined, isGeneric ? this._rowId : undefined)
                } else {
                    items = await DataBaseHelper.loadIDsWithLabelForClass(values.class, values.idLabelField, isGeneric ? this._rowId : undefined)
                }
                let hasSetInitialValue = false
                let firstValue = '0'
                items['0'] = '- empty -'
                selectIDs.replaceChildren()
                for(const [id, label] of Object.entries(items ?? {}).sort(
                    (a, b)=>{return (parseInt(a[0]) > parseInt(b[0]) ? 1 : -1)}
                )) {
                    const option = document.createElement('option') as HTMLOptionElement
                    if(!parseInt(id)) option.style.color = 'darkgray'
                    option.value = id
                    option.innerHTML = label && label.length > 0 ? label : id
                    if(id.toString() == value.toString()) {
                        firstValue = id
                        option.selected = true
                        input.innerHTML = id.toString()
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
                li.appendChild(selectGeneric)
                const setNewReference = this.appendNewReferenceItemButton(li, values, this._rowId)

                const items = DataObjectMap.getNames(values.genericLike, true)
                const genericClasses = await DataBaseHelper.loadIDClasses([value.toString()])
                const genericClass = genericClasses[value.toString()] ?? ''
                let isNewReferenceItemButtonInitialized = false
                for(const clazz of items) {
                    if(!isNewReferenceItemButtonInitialized) {
                        // We need to do this or generic lists will have the super class as class to instantiate.
                        setNewReference(clazz)
                        isNewReferenceItemButtonInitialized = true
                    }
                    if(clazz) {
                        const option = document.createElement('option') as HTMLOptionElement
                        option.innerHTML = clazz
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
            editButton.innerHTML = '📝'
            editButton.title = 'Edit the referenced item.'
            editButton.classList.add('inline-button')
            editButton.onclick = (event)=>{
                if(selectIDs.value !== '0') {
                    let link = `editor.php?id=${selectIDs.value}`
                    if(isGeneric) link += `&p=${this._rowId}`
                    window.location.replace(link)
                }
            }
            li.appendChild(selectIDs)
            li.appendChild(editButton)
            if(values.genericLike) {
                await buildSelectOfIDs(selectGeneric.value)
            } else {
                await buildSelectOfIDs()
            }
        }
        if(thisTypeValues.isIdReference && thisTypeValues.genericLike.length == 0) this.appendNewReferenceItemButton(li, thisTypeValues)
        this.appendRemoveButton(li, origin, path, label)
        this.appendDocumentationIcon(li, key, instanceMeta)
        root.appendChild(li)
        return
    }

    private async promptForKey(path: IJsonEditorPath) {
        const oldKey = Utils.clone(path).pop() ?? ''
        const newKey = prompt(`Provide new key for "${path.join('.')}"`, oldKey.toString())
        if(newKey && newKey.length > 0) {
            await this.handleKey(Utils.unescapeHTML(newKey), path)
        }
    }

    private async buildFields(
        root: HTMLElement,
        instance: object,
        instanceMeta: BaseMeta|undefined,
        path: IJsonEditorPath,
        objectKey: string|undefined,
        origin: EOrigin,
        originListCount: number = 1
    ): Promise<void> {
        const pathKey = path[path.length-1] ?? 'root'
        const newRoot = this.buildLI('')
        const newUL = this.buildUL()

        // Sort out type values for ID references
        const thisType = instanceMeta?.types ? instanceMeta.types[pathKey] ?? '' : ''
        const thisTypeValues = BaseDataObject.parseRef(thisType)
        const instanceType = instance.constructor.name

        if(originListCount > 1) this.appendDragButton(newRoot, origin, path)

        if(path.length == 1) { // Root object generates a key field
            await this.buildField(root, EJsonEditorFieldType.String, `${objectKey ?? ''}`, instanceMeta, path, EOrigin.Single)
        } else {
            // A dictionary has editable keys
            if(origin == EOrigin.ListDictionary) {
                const keyInput = document.createElement('code') as HTMLSpanElement
                keyInput.contentEditable = 'false'
                keyInput.innerHTML = pathKey.toString()
                keyInput.onclick = (event)=>{
                    this.promptForKey(path)
                }
                newRoot.appendChild(keyInput)
            }
            // An array has a fixed index
            else {
                const strongSpan = document.createElement('strong') as HTMLSpanElement
                strongSpan.innerHTML = origin == EOrigin.ListArray
                    ? `${pathKey}`
                    : Utils.camelToTitle(pathKey.toString())
                if(thisTypeValues.class) strongSpan.title = `Type: ${thisTypeValues.class}`
                newRoot.appendChild(strongSpan)
            }
        }

        // Add new item button if we have a type defined
        await this.appendAddButton(newRoot, thisTypeValues, instance, path)
        this.appendRemoveButton(newRoot, origin, path, undefined)
        if(thisTypeValues.genericLike.length == 0) this.appendNewReferenceItemButton(newRoot, thisTypeValues)
        this.appendDocumentationIcon(newRoot, pathKey, instanceMeta)

        // Get new instance meta if we are going deeper. TODO: This needs to support ENUMs
        let newInstanceMeta = instanceMeta
        if(thisType && DataObjectMap.hasInstance(thisType)) { // For lists class instances
            newInstanceMeta = DataObjectMap.getMeta(thisType) ?? instanceMeta
        } else if (instanceType && DataObjectMap.hasInstance(instanceType)) { // For single class instances
            newInstanceMeta = DataObjectMap.getMeta(instanceType) ?? instanceMeta
        }
        if(Array.isArray(instance)) {
            const newOrigin = thisType ? EOrigin.ListArray : EOrigin.Single
            for(let i=0; i<instance.length; i++) {
                const newPath = this.clone(path)
                newPath.push(i)
                await this.stepData(newUL, instance[i], newInstanceMeta, newPath, undefined, newOrigin, instance.length)
            }
        } else {
            const newOrigin = thisType ? EOrigin.ListDictionary : EOrigin.Single
            for(const key of Object.keys(instance)) {
                const newPath = this.clone(path)
                newPath.push(key.toString())
                await this.stepData(newUL, (instance as any)[key.toString()], newInstanceMeta, newPath, undefined, newOrigin)
            }
        }
        newRoot.appendChild(newUL)
        root.appendChild(newRoot)
        return
    }
    // region Buttons
    private appendDragButton(element: HTMLElement, origin: EOrigin, path: (string | number)[]) {
        if(origin == EOrigin.ListArray) {
            const span = document.createElement('span') as HTMLSpanElement
            span.innerHTML = '🤚'
            span.title = 'Drag & drop in array'
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
                    await this.handleArrayMove(fromPath, path)
                }
            }
            element.appendChild(span)
        }
    }

    /**
     * Returns a lambda that can update the link of the button to lead to a different class.
     * @param element
     * @param typeValues
     * @private
     */
    private appendNewReferenceItemButton(element: HTMLElement, typeValues: IBaseDataObjectRefValues, parentId?: number): Function {
        let button: HTMLButtonElement|undefined = undefined
        const updateLink = (clazz: string)=>{
            if(button) {
                button.title = `Create new item of type: ${clazz}`+(parentId ? ` for parent: ${this._key} (${parentId})` : '')
                button.onclick = (event)=>{
                    this.checkIfModified()
                    window.location.replace(`?c=${clazz}&n=1`+(parentId ? `&p=${parentId}` : ''))
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
        if(docStr.length > 0) {
            const span = document.createElement('span') as HTMLSpanElement
            span.classList.add('documentation-icon')
            span.innerHTML = ' 💬'
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
     * @param checkModified Will not set, only check and color label.
     * @private
     */
    private handleValue(
        value: string|number|boolean|object|null,
        path: (string | number)[],
        label: HTMLElement|undefined = undefined,
        checkModified: boolean = false
    ) {
        let current: any = this._instance
        let currentOriginal: any = this._originalInstance
        if(path.length == 1) {
            if(value == this._originalKey) {
                // Same as original value
                if(label) label.style.backgroundColor = this._labelUnchangedColor
            } else {
                // New value
                this._key = `${value}`
                if(label) label.style.backgroundColor = this._labelChangedColor
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
                    if(current[path[i]] != value || checkModified) {
                        if(!checkModified) current[path[i]] = value // Actual update in the JSON structure
                        if(currentOriginalValue == value) {
                            // Same as original value
                            if(label) label.style.backgroundColor = this._labelUnchangedColor
                        } else {
                            // New value
                            if(label) label.style.backgroundColor = this._labelChangedColor
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
                    const newKey = prompt('Provide a key for the new entry')
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