import Utils from '../../Classes/Utils.js'
import BaseDataObject, {EmptyDataObject,} from '../../Objects/BaseDataObject.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataObjectMap, {DataObjectEntry} from '../../Objects/DataObjectMap.js'

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

    private readonly _labelUnchangedColor = 'transparent'
    private readonly _labelChangedColor = 'pink'
    constructor() {}

    build(
        key: string,
        instance: object&BaseDataObject,
        dirty: boolean = false,
        hideKey: boolean = false,
        isRebuild: boolean = false
    ): HTMLElement {
        if(!isRebuild) {
            this._key = key
            this._originalKey = key
            this._hideKey = hideKey
            if(instance) {
                this._instance = instance.__clone()
                this._originalInstance = instance.__clone();
            }
            this._originalInstanceType = instance.constructor.name
        }

        if(!this._root) this._root = this.buildUL()
        else this._root.replaceChildren()
        this._labels = []
        const instanceMeta = DataObjectMap.getMeta(this._originalInstanceType ?? '')
        this.stepData(this._root, instance, instanceMeta, ['Key'], key, EOrigin.Unknown)
        if(dirty) this.highlightLabels()
        return this._root
    }
    private rebuild() {
        this.build(
            this._key,
            this._instance,
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

    private stepData(
        root: HTMLElement,
        data: string|number|boolean|object,
        instanceMeta: DataObjectEntry|undefined,
        path: (string|number)[],
        key: string|undefined = undefined,
        origin: EOrigin = EOrigin.Unknown
    ) {
        const type = typeof data
        switch(type) {
            case 'string':
                this.buildField(root, EJsonEditorFieldType.String, data, instanceMeta, path, origin)
                break
            case 'number':
                this.buildField(root, EJsonEditorFieldType.Number, data, instanceMeta, path, origin)
                break
            case 'boolean':
                this.buildField(root, EJsonEditorFieldType.Boolean, data, instanceMeta, path, origin)
                break
            case 'object':
                if(data === null) {
                    // Exist to show that something is broken as we don't support the null type.
                    this.buildField(root, EJsonEditorFieldType.Null, data, instanceMeta, path, origin)
                } else {
                    this.buildFields(root, data as object, instanceMeta, path, key, origin)
                }
                break
            default:
                console.warn('Unhandled data type!', data)
        }
    }

    private buildUL(): HTMLUListElement {
        return document.createElement('ul') as HTMLUListElement
    }
    private buildLI(html: string): HTMLLIElement {
        const li = document.createElement('li') as HTMLLIElement
        li.innerHTML = html
        return li
    }

    private async buildField(
        root: HTMLElement,
        type: EJsonEditorFieldType,
        value: string|number|boolean|object,
        instanceMeta: DataObjectEntry|undefined,
        path:(string|number)[],
        origin: EOrigin
    ) {
        const key = path[path.length-1] ?? ''
        const previousKey = path[path.length-2] ?? ''
        const pathStr = path.join('.')
        const isRoot = path.length == 1

        // Sort out type values for ID references
        const parentType = instanceMeta?.types ? instanceMeta.types[previousKey] ?? '' : ''
        const parentTypeArr = parentType.split('|')
        const parentTypeClass = parentTypeArr.shift() ?? ''
        let isIdList = false
        let idLabelField = ''
        for(const t of parentTypeArr) {
            if(t == 'id') isIdList = true
            else {
                const [k, v] = t.split('=')
                if(k == 'label') idLabelField = v
            }
        }

        // Label
        let keyInput: HTMLSpanElement|undefined
        const label: HTMLSpanElement = document.createElement('span') as HTMLSpanElement
        if(origin == EOrigin.ListDictionary) {
            label.innerHTML = ' : '
            keyInput = document.createElement('code') as HTMLSpanElement
            keyInput.contentEditable = 'false'
            keyInput.innerHTML = key.toString()
        } else {
            label.innerHTML = isRoot ? `<strong>${key}</strong>: ` : `${Utils.camelToTitle(key.toString())}: `
            label.onclick = (event)=>{
                input.click()
                input.focus()
            }
        }
        label.classList.add('input-label')
        this._labels.push(label)

        this.handleValue(value, path, label ,true) // Will colorize label

        const li = document.createElement('li') as HTMLLIElement

        // Optional editable key
        if(keyInput) {
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

        if(isIdList) {
            console.log(isIdList, idLabelField, parentTypeClass)
            input.contentEditable = 'false'
            input.classList.add('disabled')
            input.onclick = ()=>{}
            input.onchange = handle

            const select = document.createElement('select') as HTMLSelectElement
            const items = await DataBaseHelper.loadJson(parentTypeClass)
            // for(const [k, v] of (items ?? {})) {
                // select.add()
            // }
            li.appendChild(select)
        }

        this.appendRemoveButton(origin, path, label, li)
        this.appendDocumentationIcon(key, instanceMeta, path, li)
        root.appendChild(li)
    }

    private promptForKey(path: (string|number)[]) {
        const oldKey = Utils.clone(path).pop() ?? ''
        const newKey = prompt(`Provide new key for "${path.join('.')}"`, oldKey.toString())
        if(newKey && newKey.length > 0) {
            this.handleKey(Utils.unescapeHTML(newKey), path)
        }
    }

    private buildFields(
        root: HTMLElement,
        instance: object,
        instanceMeta: DataObjectEntry|undefined,
        path:(string|number)[],
        objectKey: string|undefined,
        origin: EOrigin
    ) {
        const pathKey = path[path.length-1] ?? 'root'
        const newRoot = this.buildLI('')
        const newUL = this.buildUL()

        const type = instanceMeta?.types ? instanceMeta.types[pathKey] ?? '' : ''
        const typeStr = type.length == 0 ? '' : ` (<code>${type}</code>)`
        const instanceType = instance.constructor.name

        if(path.length == 1) { // Root object generates a key field
            this.buildField(root, EJsonEditorFieldType.String, `${objectKey ?? ''}`, instanceMeta, path, EOrigin.Single)
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
                strongSpan.innerHTML = Utils.camelToTitle(pathKey.toString())
                newRoot.appendChild(strongSpan)
            }
        }
        if(typeStr.length > 0) {
            const typeSpan = document.createElement('span') as HTMLSpanElement
            typeSpan.innerHTML = typeStr
            newRoot.appendChild(typeSpan)
        }

        if(type.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = (event)=>{
                const typeArr = type.split('|')
                const shouldBeIdList = typeArr.indexOf('id') != -1
                const justType = typeArr.shift()
                if(Array.isArray(instance)) {
                    switch(type) {
                        case 'number': instance.push(0); break
                        case 'boolean': instance.push(false); break
                        case 'string': instance.push(''); break
                        default:
                            if(shouldBeIdList) {
                                instance.push(0)
                                break
                            }
                            const newInstance = DataObjectMap.getInstance(justType, undefined)
                            if(newInstance) instance.push(newInstance.__clone()) // For some reason this would do nothing unless cloned.
                            else console.warn('Unhandled type:', justType)
                    }
                    this.handleValue(instance, path, newRoot)
                    this.rebuild()
                } else {
                    const newKey = prompt('Provide a key for the new entry')
                    if(newKey && newKey.length > 0) {
                        switch(type) {
                            case 'number': (instance as any)[newKey] = 0; break
                            case 'boolean': (instance as any)[newKey] = false; break
                            case 'string': (instance as any)[newKey] = ''; break
                            default:
                                if(shouldBeIdList) {
                                    (instance as any)[newKey] = 0
                                    break
                                }
                                const newInstance = DataObjectMap.getInstance(justType, undefined)
                                if(newInstance) (instance as any)[newKey] = newInstance.__clone()
                                else console.warn('Unhandled type:', justType)
                        }
                        this.handleValue(instance, path, newRoot)
                        this.rebuild()
                    }
                }

            }
            newRoot.appendChild(newButton)
        }
        this.appendRemoveButton(origin, path, undefined, newRoot)
        this.appendDocumentationIcon(pathKey, instanceMeta, path, newRoot)

        // Get new instance meta if we are going deeper.
        let newInstanceMeta = instanceMeta
        if(type && DataObjectMap.hasInstance(type)) { // For lists
            newInstanceMeta = DataObjectMap.getMeta(type) ?? instanceMeta
        } else if (instanceType && DataObjectMap.hasInstance(instanceType)) { // For single class instances
            newInstanceMeta = DataObjectMap.getMeta(instanceType) ?? instanceMeta
        }
        if(Array.isArray(instance)) {
            const newOrigin = type ? EOrigin.ListArray : EOrigin.Single
            for(let i=0; i<instance.length; i++) {
                const newPath = this.clone(path)
                newPath.push(i)
                this.stepData(newUL, instance[i], newInstanceMeta, newPath, undefined, newOrigin)
            }
        } else {
            const newOrigin = type ? EOrigin.ListDictionary : EOrigin.Single
            for(const key of Object.keys(instance).sort()) {
                const newPath = this.clone(path)
                newPath.push(key)
                this.stepData(newUL, (instance as any)[key], newInstanceMeta, newPath, undefined, newOrigin)
            }
        }
        newRoot.appendChild(newUL)
        root.appendChild(newRoot)
    }

    private appendRemoveButton(origin: EOrigin, path: (string | number)[], label: HTMLElement|undefined, element: HTMLElement) {
        if(origin == EOrigin.ListArray || origin == EOrigin.ListDictionary) {
            const button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '💥'
            button.title = 'Remove item'
            button.classList.add('delete-button')
            button.tabIndex = -1
            button.onclick = (event)=>{
                this.handleValue(null,  path, label)
                this.rebuild()
            }
            element.appendChild(button)
        }
    }

    private appendDocumentationIcon(keyValue: string|number, instanceMeta: DataObjectEntry|undefined, path: (string|number)[], element: HTMLElement) {
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
    }

    private handleKey(
        keyValue: string,
        path: (string|number)[],
    ) {
        let current: any = this._instance
        for (let i = 1; i < path.length; i++) {
            // Will change the key for a property
            if (i == path.length - 1) {
                const p = path[i]
                const contents = Utils.clone(current[p])
                delete current[p]
                current[keyValue] = contents
                this.rebuild()
            } else {
                // Continue to navigate down into the data structure
                current = current[path[i]]
            }
        }
    }

    getData(): any {
        return this._instance
    }
    setData(data: any): any {
        this._instance = data
        this.rebuild()
    }
    getKey(): string {
        return this._key
    }
}
enum EJsonEditorFieldType {
    String,
    Boolean,
    Number,
    Null
}