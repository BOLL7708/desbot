import Utils from '../../Classes/Utils.js'
import {IStringDictionary} from '../../Interfaces/igeneral.js'

enum EOrigin {
    Unknown,
    Array,
    Object
}

export default class JsonEditor {
    private _key: string = ''
    private _originalKey: string = ''
    private _data: any
    private _originalData: any
    private _documentation: IStringDictionary|undefined = undefined
    private _arrayTypes: IStringDictionary|undefined = undefined
    private _root: HTMLUListElement|undefined = undefined
    private _inputs: HTMLInputElement[] = []
    private _labels: HTMLLabelElement[] = []
    private _hideKey: boolean = false

    private readonly _labelUnchangedColor = 'transparent'
    private readonly _labelChangedColor = 'pink'
    constructor() {}

    build(
        key: string,
        data: object,
        documentation: IStringDictionary|undefined,
        arrayTypes: IStringDictionary|undefined,
        dirty: boolean = false,
        hideKey: boolean = false,
        isRebuild: boolean = false
    ): HTMLElement {
        if(!isRebuild) {
            this._key = key
            this._originalKey = key
            this._hideKey = hideKey
            if(data) {
                this._data = Utils.clone(data)
                this._originalData = Utils.clone(data)
            }
            this._documentation = documentation
            this._arrayTypes = arrayTypes
        }
        if(!this._root) this._root = this.buildUL()
        else this._root.replaceChildren()
        this._inputs = []
        this._labels = []
        this.stepData(this._root, this._data, ['Key'], key, EOrigin.Unknown)
        if(dirty) this.highlightLabels()
        return this._root
    }
    private rebuild() {
        this.build(this._key, this._data, this._documentation, this._arrayTypes, false, this._hideKey, true)
    }

    private highlightLabels() {
        for(const label of this._labels) {
            label.style.backgroundColor = this._labelChangedColor
        }
    }

    private stepData(
        root: HTMLElement,
        data: any,
        path: (string|number)[],
        key: string|undefined = undefined,
        origin: EOrigin = EOrigin.Unknown
    ) {
        const type = typeof data
        switch(type) {
            case 'string':
                this.buildField(root, EJsonEditorFieldType.String, data, path, origin)
                break
            case 'number':
                this.buildField(root, EJsonEditorFieldType.Number, data, path, origin)
                break
            case 'boolean':
                this.buildField(root, EJsonEditorFieldType.Boolean, data, path, origin)
                break
            case 'object':
                if(data === null) {
                    // Exist to show that something is broken as we don't support the null type.
                    this.buildField(root, EJsonEditorFieldType.Null, data, path, origin)
                } else if(Array.isArray(data)) {
                    this.buildArrayField(root, data, path, origin)
                } else if(data.constructor == Object) {
                    this.buildObjectField(root, data, path, key, origin)
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
        value: string|number|boolean|null,
        path:(string|number)[],
        origin: EOrigin
    ) {
        const key = path[path.length-1] ?? ''
        const pathStr = path.join('.')
        const isRoot = path.length == 1

        // Label
        const label = document.createElement('label') as HTMLLabelElement
        this._labels.push(label)
        label.innerHTML = isRoot ? `<strong>${key}</strong>: ` : `${Utils.camelToTitle(key.toString())}: `
        label.htmlFor = pathStr
        this.handleValue(value, path, label ,true) // Will colorize label

        // Item
        const li = document.createElement('li') as HTMLLIElement
        li.appendChild(label)

        // Input
        const input = document.createElement('input') as HTMLInputElement
        this._inputs.push(input)
        input.id = pathStr
        if(isRoot && this._hideKey) input.disabled = true

        let skip = false
        let update = (event: Event) => {}

        switch (type) {
            case EJsonEditorFieldType.String:
                input.value = `${value}`
                input.type = 'text'
                input.size = 32
                update = (event) => {
                    this.handleValue(input.value, path, label)
                }
                break
            case EJsonEditorFieldType.Boolean:
                input.type = 'checkbox'
                input.checked = value as boolean
                update = (event) => {
                    this.handleValue(input.checked, path, label)
                }
                break
            case EJsonEditorFieldType.Number:
                input.value = `${value}`
                input.type = 'number'
                input.size = 8
                update = (event)=>{
                    this.handleValue(parseFloat(input.value), path, label)
                }
                break
            case EJsonEditorFieldType.Null:
                input.size = 4
                input.disabled = true
                input.value = 'NULL'
                break
            default:
                skip = true
        }
        if(!skip) {
            input.onkeydown = update
            input.onkeyup = update
            input.onchange = update
            input.onblur = update
            li.appendChild(input)
        }
        if(origin == EOrigin.Array) {
            const button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '💥'
            button.title = 'Remove item from array'
            button.classList.add('delete-button')
            button.onclick = (event)=>{
                this.handleValue(null,  path, label)
                this.rebuild()
            }
            li.appendChild(button)
        }
        const docStr = this._documentation ? this._documentation[key] ?? '' : ''
        let docLabel = (path.length == 2 && docStr.length > 0) ? ' 💬' : ''
        if(docLabel.length > 0) {
            const span = document.createElement('span') as HTMLSpanElement
            span.innerHTML = docLabel
            span.title = docStr
            li.appendChild(span)
        }
        root.appendChild(li)
    }

    private buildArrayField(
        root: HTMLElement,
        data: any[],
        path:(string|number)[],
        origin: EOrigin
    ) {
        const key = path[path.length-1] ?? ''
        const newRoot = this.buildLI('')
        const newUL = this.buildUL()

        newRoot.innerHTML += `<strong>${Utils.camelToTitle(key.toString())}</strong> (Array)`
        const pathKey = path[path.length-1]
        const arrayType = this._arrayTypes ? this._arrayTypes[pathKey] ?? '' : ''
        if(path.length == 2 && arrayType.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item to array'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = (event)=>{
                switch(arrayType) {
                    case 'number': data.push(0); break
                    case 'boolean': data.push(false); break
                    case 'string': data.push(''); break
                    default: console.warn('Unhandled arrayType:', arrayType)
                }
                this.handleValue(data, path, newRoot)
                this.rebuild()
            }
            newRoot.appendChild(newButton)
        }
        for(let i=0; i<data.length; i++) {
            const newPath = this.clone(path)
            newPath.push(i)
            this.stepData(newUL, data[i], newPath, undefined, EOrigin.Array)
        }
        newRoot.appendChild(newUL)
        root.appendChild(newRoot)
    }

    private buildObjectField(
        root: HTMLElement,
        data: any,
        path:(string|number)[],
        objectKey: string|undefined,
        origin: EOrigin
    ) {
        const thisKey = path[path.length-1] ?? 'root'
        const newRoot = this.buildLI('')
        const newUL = this.buildUL()
        if(path.length == 1) { // Root object generates a key field
            this.buildField(root, EJsonEditorFieldType.String, `${objectKey ?? ''}`, path, EOrigin.Object)
        } else {
            newRoot.innerHTML += `<strong>${Utils.camelToTitle(thisKey.toString())}</strong> (Object)`
        }
        for(const key of Object.keys(data).sort()) {
            const newPath = this.clone(path)
            newPath.push(key)
            this.stepData(newUL, data[key], newPath)
        }
        newRoot.appendChild(newUL)
        root.appendChild(newRoot)
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
        value: string|number|boolean|string[]|number[]|boolean[]|null,
        path: (string | number)[],
        label: HTMLElement,
        checkModified: boolean = false
    ) {
        let current: any = this._data
        let currentOriginal: any = this._originalData
        if(path.length == 1) {
            if(value == this._originalKey) {
                // Same as original value
                label.style.backgroundColor = this._labelUnchangedColor
            } else {
                // New value
                this._key = `${value}`
                label.style.backgroundColor = this._labelChangedColor
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
                        // TODO: Untested
                        delete current[p1]
                    }
                    return
                }

                // If we're on the last depth, act on it
                if(i == path.length-1) {
                    // Not same as the stored one, or just checked if modified
                    if(current[path[i]] != value || checkModified) {
                        if(!checkModified) current[path[i]] = value // Actual update in the JSON structure
                        if(currentOriginal[path[i]] == value) {
                            // Same as original value
                            label.style.backgroundColor = this._labelUnchangedColor
                        } else {
                            // New value
                            label.style.backgroundColor = this._labelChangedColor
                        }
                    }
                } else {
                    // Continue to navigate down into the data structure
                    current = current[path[i]]
                    currentOriginal = currentOriginal[path[i]]
                }
            }
        }
    }

    getData(): any {
        return this._data
    }
    getKey(): string {
        return this._key
    }
}
enum EJsonEditorFieldType {
    String,
    Boolean,
    Number,
    Array,
    Dictionary,
    Null
}