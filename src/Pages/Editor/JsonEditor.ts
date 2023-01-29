import Utils from '../../Classes/Utils.js'
import {IStringDictionary} from '../../Interfaces/igeneral.js'
import BaseDataObject, {
    BaseDataObjectMap,
    BaseDataObjectMeta,
    EmptyDataObject,
    EmptyDataObjectMap
} from '../../Classes/BaseDataObject.js'

enum EOrigin {
    Unknown,
    List,
    Single
}

export default class JsonEditor {
    private _classMap: BaseDataObjectMap = new EmptyDataObjectMap()
    private _key: string = ''
    private _originalKey: string = ''
    private _instance: object&BaseDataObject = new EmptyDataObject()
    private _originalInstance: object&BaseDataObject = new EmptyDataObject()
    private _originalInstanceType: string|undefined
    private _root: HTMLUListElement|undefined = undefined
    private _inputs: HTMLSpanElement[] = []
    private _labels: HTMLSpanElement[] = []
    private _hideKey: boolean = false

    private readonly _labelUnchangedColor = 'transparent'
    private readonly _labelChangedColor = 'pink'
    constructor() {}

    build(
        classMap: BaseDataObjectMap,
        key: string,
        instance: object&BaseDataObject,
        dirty: boolean = false,
        hideKey: boolean = false,
        isRebuild: boolean = false
    ): HTMLElement {
        if(!isRebuild) {
            this._classMap = classMap
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
        this._inputs = []
        this._labels = []
        const instanceMeta = this._classMap.getMeta(this._originalInstanceType ?? '')
        this.stepData(this._root, instance, instanceMeta, ['Key'], key, EOrigin.Unknown)
        if(dirty) this.highlightLabels()
        return this._root
    }
    private rebuild() {
        this.build(
            this._classMap,
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
        instanceMeta: BaseDataObjectMeta|undefined,
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

    private buildField(
        root: HTMLElement,
        type: EJsonEditorFieldType,
        value: string|number|boolean|object,
        instanceMeta: BaseDataObjectMeta|undefined,
        path:(string|number)[],
        origin: EOrigin
    ) {
        const key = path[path.length-1] ?? ''
        const pathStr = path.join('.')
        const isRoot = path.length == 1

        // Label
        const label = document.createElement('span') as HTMLSpanElement
        label.classList.add('input-label')
        this._labels.push(label)
        label.innerHTML = isRoot ? `<strong>${key}</strong>: ` : `${Utils.camelToTitle(key.toString())}: `
        this.handleValue(value, path, label ,true) // Will colorize label

        // Item
        const li = document.createElement('li') as HTMLLIElement
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
                const on = '✅ true'
                const off = '❌ false'
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
                    const validKeys = ['Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
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
        if(!skip) {
            if(isRoot && this._hideKey) {
                input.contentEditable = 'false'
                input.classList.add('disabled')
                input.onclick = ()=>{}
            }
            input.id = pathStr
            this._inputs.push(input)
            input.oninput = handle

            li.appendChild(input)
        }

        this.appendRemoveButton(origin, path, label, li)
        label.onclick = (event)=>{
            input.click()
            input.focus()
        }
        this.appendDocumentationIcon(key, instanceMeta, path, li)
        root.appendChild(li)
    }

    private buildFields(
        root: HTMLElement,
        instance: object,
        instanceMeta: BaseDataObjectMeta|undefined,
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
            newRoot.innerHTML += `<strong>${Utils.camelToTitle(pathKey.toString())}</strong>${typeStr}`
        }

        if(type.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = (event)=>{
                if(Array.isArray(instance)) {
                    switch(type) {
                        case 'number': instance.push(0); break
                        case 'boolean': instance.push(false); break
                        case 'string': instance.push(''); break
                        default:
                            const newInstance = this._classMap.getInstance(type, undefined, true)
                            if(newInstance) instance.push(newInstance.__clone()) // For some reason this would do nothing unless cloned.
                            else console.warn('Unhandled type:', type)
                    }
                } else {
                    switch(type) {
                        case 'number': (instance as any)['new'] = 0; break
                        case 'boolean': (instance as any)['new'] = false; break
                        case 'string': (instance as any)['new'] = ''; break
                        default:
                            const newInstance = this._classMap.getInstance(type, undefined, true)
                            if(newInstance) (instance as any)['new'] = newInstance.__clone()
                            else console.warn('Unhandled type:', type)
                    }
                }
                this.handleValue(instance, path, newRoot)
                this.rebuild()
            }
            newRoot.appendChild(newButton)
        }
        this.appendRemoveButton(origin, path, undefined, newRoot)
        this.appendDocumentationIcon(pathKey, instanceMeta, path, newRoot)

        // Get new instance meta if we are going deeper.
        let newInstanceMeta = instanceMeta
        if(type && this._classMap.hasInstance(type, true)) { // For lists
            newInstanceMeta = this._classMap.getMeta(type) ?? instanceMeta
        } else if (instanceType && this._classMap.hasInstance(instanceType, true)) { // For single class instances
            newInstanceMeta = this._classMap.getMeta(instanceType) ?? instanceMeta
        }
        const newOrigin = type ? EOrigin.List : EOrigin.Single
        if(Array.isArray(instance)) {
            for(let i=0; i<instance.length; i++) {
                const newPath = this.clone(path)
                newPath.push(i)
                this.stepData(newUL, instance[i], newInstanceMeta, newPath, undefined, newOrigin)
            }
        } else {
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
        if(origin == EOrigin.List) {
            const button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '💥'
            button.title = 'Remove item'
            button.classList.add('delete-button')
            button.onclick = (event)=>{
                this.handleValue(null,  path, label)
                this.rebuild()
            }
            element.appendChild(button)
        }
    }

    private appendDocumentationIcon(keyValue: string|number, instanceMeta: BaseDataObjectMeta|undefined, path: (string|number)[], element: HTMLElement) {
        const key = keyValue.toString()
        const docStr = (instanceMeta?.documentation ?? {})[key] ?? ''
        if(docStr.length > 0) {
            const span = document.createElement('span') as HTMLSpanElement
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
                if(value === null && i == path.length-2) {
                    const p1 = path[i]
                    const p2 = path[i+1]
                    if(Array.isArray(current[p1]) && typeof p2 == 'number') {
                        (current[p1] as []).splice(p2, 1)
                    } else {
                        delete current[p1][p2]
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

    getData(): any {
        return this._instance
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