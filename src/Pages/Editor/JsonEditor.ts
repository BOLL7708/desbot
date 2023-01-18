import Utils from '../../Classes/Utils.js'

export default class JsonEditor {
    readonly _highlightColor = 'pink'
    private _key: string = ''
    private _originalKey: string = ''
    private _data: any
    private _originalData: any
    private _docs: { [key:string]: string }|undefined = undefined
    private _inputs: HTMLInputElement[] = []
    private _labels: HTMLLabelElement[] = []
    private _hideKey: boolean = false
    constructor() {}

    build(key: string, data: object, docs: {[key:string]: string}|undefined, dirty: boolean = false, hideKey: boolean = false): HTMLElement {
        this._key = key
        this._originalKey = key
        this._hideKey = hideKey
        if(data) {
            this._data = Utils.clone(data)
            this._originalData = Utils.clone(data)
        }
        this._docs = docs
        const root = this.buildUL()
        this._inputs = []
        this._labels = []
        this.stepData(root, this._data, ['Key'], key, true)
        if(dirty) this.highlightLabels()
        return root
    }

    private highlightLabels() {
        for(const label of this._labels) {
            label.style.backgroundColor = this._highlightColor
        }
    }

    private stepData(
        root: HTMLElement,
        data: any,
        path: (string|number)[],
        groupKey: string|undefined = undefined,
        isRoot: boolean = false
    ) {
        const type = typeof data
        const thisKey = path[path.length-1] ?? 'root'
        switch(type) {
            case 'string':
                this.buildField(root, EJsonEditorFieldType.String, data, path, isRoot)
                break
            case 'number':
                this.buildField(root, EJsonEditorFieldType.Number, data, path, isRoot)
                break
            case 'boolean':
                this.buildField(root, EJsonEditorFieldType.Boolean, data, path, isRoot)
                break
            case 'object':
                if(data === null) {
                    // TODO: Should this be included to be able to add some kind of
                    //  reference to something not set yet, like a sub structure?
                    this.buildField(root, EJsonEditorFieldType.Null, data, path, isRoot)
                } else {
                    const newRoot = this.buildLI('')
                    const newUL = this.buildUL()
                    if(Array.isArray(data)) {
                        newRoot.innerHTML += `<strong>${thisKey} []</strong>`
                        for(let i=0; i<data.length; i++) {
                            const newPath = this.clone(path)
                            newPath.push(i)
                            this.stepData(newUL, data[i], newPath)
                        }
                    } else if(data.constructor == Object) {
                        if(path.length == 1) { // Root object generates a key field
                            this.buildField(root, EJsonEditorFieldType.String, `${groupKey ?? ''}`, path, isRoot)
                        } else {
                            newRoot.innerHTML += `<strong>${thisKey} {}</strong>`
                        }
                        for(const key of Object.keys(data).sort()) {
                            const newPath = this.clone(path)
                            newPath.push(key)
                            this.stepData(newUL, data[key], newPath)
                        }
                    }
                    newRoot.appendChild(newUL)
                    root.appendChild(newRoot)
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
        isRoot: boolean
    ) {
        const key = path[path.length-1] ?? ''
        const pathStr = path.join('.')

        // Label
        const label = document.createElement('label') as HTMLLabelElement
        this._labels.push(label)
        label.innerHTML = isRoot ? `<strong>${key}</strong>: ` : `${key}: `
        label.htmlFor = pathStr

        // Item
        const li = document.createElement('li') as HTMLLIElement
        const docStr = this._docs ? this._docs[key] ?? '' : ''
        let docLabel = (path.length == 2 && docStr.length > 0) ? ' 💬' : ''
        if(docLabel.length > 0) li.title = docStr
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
                    this.updateValue(input.value, path, label)
                }
                break
            case EJsonEditorFieldType.Boolean:
                input.type = 'checkbox'
                input.checked = value as boolean
                update = (event) => {
                    this.updateValue(input.checked, path, label)
                }
                break
            case EJsonEditorFieldType.Number:
                input.value = `${value}`
                input.type = 'number'
                input.size = 8
                update = (event)=>{
                    this.updateValue(parseFloat(input.value), path, label)
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
        if(docLabel.length > 0) {
            const span = document.createElement('span') as HTMLSpanElement
            span.innerHTML = docLabel
            li.appendChild(span)
        }
        root.appendChild(li)
    }

    private clone<T>(value: T): T {
        return JSON.parse(JSON.stringify(value)) as T
    }

    private updateValue(value: string|number|boolean, path: (string | number)[], label: HTMLLabelElement) {
        let current: any = this._data
        let currentOriginal: any = this._originalData
        if(path.length == 1) {
            if(value == this._originalKey) {
                // Same as original value
                label.style.backgroundColor = 'transparent'
            } else {
                // New value
                this._key = `${value}`
                label.style.backgroundColor = this._highlightColor
            }
        } else {
            for(let i = 1; i<path.length; i++) {
                // If we're on the last depth, act on it
                if(i == path.length-1) {
                    // Not same as the stored one
                    if(current[path[i]] != value) {
                        current[path[i]] = value // Actual update in the JSON structure
                        if(currentOriginal[path[i]] == value) {
                            // Same as original value
                            label.style.backgroundColor = 'transparent'
                        } else {
                            // New value
                            label.style.backgroundColor = this._highlightColor
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