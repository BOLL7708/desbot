import Utils, {EUtilsTitleReturnOption} from '../../Classes/Utils.js'
import Data, {DataRefValues, EmptyData,} from '../../Objects/Data.js'
import DataBaseHelper, {IDataBaseListItems} from '../../Classes/DataBaseHelper.js'
import DataMap from '../../Objects/DataMap.js'
import {OptionsMap} from '../../Options/OptionsMap.js'
import {DataMeta} from '../../Objects/DataMeta.js'
import {ConfigEditor, ConfigEditorFavorite} from '../../Objects/Config/ConfigEditor.js'
import AssetsHelper from '../../Classes/AssetsHelper.js'
import {DataUtils} from '../../Objects/DataUtils.js'

enum EOrigin {
    Unknown,
    ListArray,
    ListDictionary,
    Single
}

export interface IStepDataOptions {
    root: HTMLElement
    data: string|number|boolean|object
    instanceMeta: DataMeta|undefined
    path: IJsonEditorPath
    key: string|undefined
    origin: EOrigin
    originListCount: number
    extraChildren: HTMLElement[]
}

interface IJsonEditorData {
    parentId: number,
    instance: any
}

export default class JsonEditor {
    private _key: string = ''
    private _originalKey: string = ''
    private _instance: object&Data = new EmptyData()
    private _originalInstance: object&Data = new EmptyData()
    private _originalInstanceType: string|undefined
    private _root: HTMLUListElement|undefined = undefined
    private _labels: HTMLSpanElement[] = []
    private _hideKey: boolean = false
    private _dirty: boolean = false
    private _rowId: number = 0
    private _potentialParentId: number = 0
    private _parentId: number = 0
    private _originalParentId: number = 0
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
        instance: object&Data,
        rowId?: number,
        potentialParentId?: number,
        currentParentId?: number,
        hideKey?: boolean,
        isRebuild?: boolean
    ): Promise<HTMLElement> {
        if(!isRebuild) {
            this._key = key
            this._originalKey = key
            this._hideKey = !!hideKey
            this._rowId = rowId ?? 0
            this._potentialParentId = potentialParentId ?? 0
            this._parentId = currentParentId ?? 0
            this._originalParentId = currentParentId ?? 0
            if(instance) {
                this._instance = await instance.__clone()
                this._originalInstance = await instance.__clone();
            }
            this._originalInstanceType = instance.constructor.name
            this._config = await DataBaseHelper.loadMain(new ConfigEditor(), true)
        }

        const urlParams = Utils.getUrlParams()
        const isChildEditor = Utils.toBool(urlParams.get('m')) // m as in Minimal
        this._labels = []
        const instanceMeta = DataMap.getMeta(this._originalInstanceType ?? '')
        const tempParent = this.buildUL()

        // region Extra Children
        const extraChildren: HTMLElement[] = []
        let parentIdInfo: HTMLElement|undefined = undefined
        let makeGlobalButton: HTMLButtonElement|undefined = undefined
        let makeLocalButton: HTMLButtonElement|undefined = undefined

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
        if(!this._config.hideIDs)  {
            const parentInfo = this.buildInfo('Parent ID', this._parentId.toString(),
                'If a parent ID is shown, this data belongs to a different row.',
                'The ID of the parent row in the database.'
            )
            parentIdInfo = parentInfo[1] ?? undefined
            extraChildren.push(...parentInfo)
        }
        if(this._parentId > 0 && !isChildEditor) {
            const parentButton = document.createElement('button') as HTMLButtonElement
            parentButton.innerHTML = '👴'
            parentButton.title = 'Edit the parent item.'
            parentButton.classList.add('inline-button')
            parentButton.onclick = (event) => {
                window.location.replace(`?id=${this._parentId}`)
            }
            extraChildren.push(parentButton)
        }

        // Parental buttons
        if(isChildEditor) {
            // Make global button
            makeGlobalButton = document.createElement('button') as HTMLButtonElement
            makeGlobalButton.style.display = 'none'
            makeGlobalButton.innerHTML = '🌍'
            makeGlobalButton.classList.add('inline-button')
            makeGlobalButton.title = 'Make global by removing the parent reference, meaning it will be listed for any parent.'
            makeGlobalButton.onclick = async (event) => {
                this._parentId = 0
                if(parentIdInfo) parentIdInfo.innerHTML = this._parentId.toString()
                toggleParentButtons(this._parentId > 0)
                this.checkIfModified()
            }
            extraChildren.push(makeGlobalButton)

            // Make local button
            makeLocalButton = document.createElement('button') as HTMLButtonElement
            makeLocalButton.style.display = 'none'
            makeLocalButton.innerHTML = '🏠'
            makeLocalButton.classList.add('inline-button')
            makeLocalButton.title = 'Make local by adding a parent reference, meaning it will only be listed for this parent, this will not break existing references.'
            makeLocalButton.onclick = async (event) => {
                if(this._potentialParentId <= 0) confirm('There is no potential parent ID for this item so it cannot be made local.')
                this._parentId = this._potentialParentId
                if(parentIdInfo) parentIdInfo.innerHTML = this._potentialParentId.toString()
                toggleParentButtons(this._parentId > 0)
                this.checkIfModified()
            }
            extraChildren.push(makeLocalButton)

            function toggleParentButtons(showGlobal: boolean) {
                if(makeGlobalButton) makeGlobalButton.style.display = showGlobal ? '' : 'none'
                if(makeLocalButton) makeLocalButton.style.display = showGlobal ? 'none' : ''
            }
            toggleParentButtons(this._parentId > 0)
        }
        // endregion

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
            this._potentialParentId,
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

    private _okShowCensored: boolean = false
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
        const thisTypeValues = DataUtils.parseRef(thisType)
        const parentType = options.instanceMeta?.types ? options.instanceMeta.types[previousKey] ?? '' : ''
        const parentTypeValues = DataUtils.parseRef(parentType)

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
                ? `<strong class="list-title">${key}</strong>: `
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


        // Preview box
        const previewBox = document.createElement('span') as HTMLElement
        previewBox.classList.add('preview')
        previewBox.style.display = 'none'
        newRoot.appendChild(previewBox)
        let player: HTMLAudioElement|null
        async function updatePreview(config: ConfigEditor) {
            player = null
            previewBox.classList.remove('no-border')
            previewBox.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'
            previewBox.style.backgroundImage = ''
            previewBox.style.backgroundColor = ''
            const value = input.innerText
            if(thisTypeValues.file || parentTypeValues.file) {
                const response = await fetch(value, { method: 'HEAD' })
                const contentType = response.headers.get('Content-Type')
                const contentLength = parseInt(response.headers.get('Content-Length') ?? '0')
                previewBox.onclick = null
                if(Utils.isImage(contentType)) {
                    previewBox.style.backgroundImage = `url('${value}')`
                    previewBox.title = `${contentType}, ${Utils.formatShortNumber(contentLength)}B, click to open`
                    previewBox.onclick = ()=>{ window.open(value, '_blank') }
                    previewBox.style.display = ''
                } else if(Utils.isAudio(contentType)) {
                    previewBox.classList.add('no-border')
                    previewBox.title = `${contentType}, ${Utils.formatShortNumber(contentLength)}B, click to play at ${config.audioPreviewVolume}% preview volume`
                    player = new Audio(value)
                    const icon = '🔊'
                    player.volume = config.audioPreviewVolume/100
                    player.onpause = ()=>{
                        playLink.innerHTML = icon
                    }
                    const playLink = document.createElement('a') as HTMLAnchorElement
                    playLink.innerHTML = icon
                    playLink.onclick = ()=>{
                        if(player) {
                            if(player.paused) {
                                playLink.innerHTML = '🛑'
                                player.play()
                            } else {
                                playLink.innerHTML = icon
                                player.pause()
                                player.currentTime = 0;
                            }
                        }
                    }
                    previewBox.replaceChildren(playLink)
                    previewBox.style.display = ''
                } else {
                    console.log('Unsupported file: ', value, contentType)
                }
            } else if(Utils.isColor(value)) {
                previewBox.style.backgroundColor = value
                previewBox.style.display = ''
            } else {
                previewBox.style.backgroundImage = ''
                previewBox.style.backgroundColor = ''
                previewBox.style.display = 'none'
            }
        }

        // Append
        if(options.originListCount > 1) {
            this.appendDragButton(newRoot, options.origin, options.path)
        }
        if(keyInput) {
            // Optional editable key
            newRoot.appendChild(keyInput)
        }
        newRoot.appendChild(label)
        newRoot.appendChild(previewBox)

        // Input
        let skip = false
        let handle = (event: Event) => {}
        let input = document.createElement('code') as HTMLSpanElement
        if(thisTypeValues.code) {
            input.classList.add('code-textarea')
            input.spellcheck = false
        }
        input.onpaste = (event)=>{
            event.preventDefault()
            let text = event.clipboardData?.getData('text/plain') ?? ''
            switch(type) {
                case EJsonEditorFieldType.String:
                    text = thisTypeValues.code ? text : text.replace(/\n/g, '\\n').replace(/\r/g, '')
                    break
                case EJsonEditorFieldType.Number:
                    let num = parseFloat(text)
                    if(isNaN(num)) num = 0
                    if(input.innerHTML.indexOf('.') > -1) {
                        num = Math.round(num) // TODO: Uh, should we always do this if there are decimals?
                    }
                    text = `${num}`
                    break
            }
            document.execCommand('insertText', false, text) // No good substitute yet.
        }
        input.onclick = (event)=>{
            // If the field is censored (by CSS) but we should ask to reveal it, this triggers.
            if(
                this._config.askToRevealSecretInput
                && thisTypeValues.secret
                && input.classList.contains('censored-always')
            ) {
                let ok = true
                let shouldFocus = false
                if(input.innerHTML.length > 0) {
                    ok = confirm('Are you sure you want to reveal this secret value?')
                } else {
                    shouldFocus = true
                }
                if(ok) {
                    this._okShowCensored = true
                    input.classList.remove('censored-always')
                    // We need to do this as otherwise the onfocus has happened before we have set the variable.
                    if(shouldFocus && input.onfocus) input.onfocus(new FocusEvent('focus'))
                }
            }
        }
        input.onfocus = ()=>{
            // Asking to show a censored field with a confirmation prompt will blur, then focus again
            // this is why we set this here, and only if the confirmation was positive.
            if(this._config.askToRevealSecretInput && this._okShowCensored) {
                input.onblur = ()=>{
                    this._okShowCensored = false
                    input.classList.add('censored-always')
                    input.onblur = null
                }
            }
        }

        let range: HTMLInputElement|undefined
        switch (type) {
            case EJsonEditorFieldType.String:
                if(thisTypeValues.secret || parentTypeValues.secret) {
                    if(this._config.askToRevealSecretInput) {
                        input.classList.add('censored-always')
                    } else {
                        input.classList.add('censored')
                    }
                }
                input.contentEditable = 'true'
                if(thisTypeValues.code) input.innerText = options.data.toString()
                else input.innerHTML = Utils.escapeHTML(`${options.data}`)
                input.onkeydown = (event)=>{
                    if (event.key === 'Enter' && !thisTypeValues.code) {
                        event.preventDefault()
                    }
                }
                handle = (event) => {
                    updatePreview(this._config).then()
                    this.handleValue(thisTypeValues.code ? input.innerText : Utils.unescapeHTML(input.innerHTML), options.path, label)
                }
                updatePreview(this._config).then()
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
                if(thisTypeValues.range.length) {
                    range = document.createElement('input') as HTMLInputElement
                }
                input.contentEditable = 'true'
                input.innerHTML = `${options.data}`
                input.onkeydown = (event)=>{
                    const validKeys = ['Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'ArrowLeft', 'Tab']
                    const key = event.key
                    const isDigit = !isNaN(parseInt(key))
                    const isValidPeriod = key == '.' && input.innerHTML.indexOf('.') == -1
                    const isValidKey = validKeys.indexOf(key) != -1
                    const isHoldingModifierKey = event.altKey || event.shiftKey || event.ctrlKey
                    const isMinus = key == '-'
                    const isPlus = key == '+'
                    if (
                        !isDigit
                        && !isValidPeriod
                        && !isValidKey
                        && !isHoldingModifierKey
                    ) {
                        event.preventDefault()
                        if(isMinus && input.innerHTML.indexOf('-') == -1) {
                            input.innerHTML = `-${input.innerHTML}`
                            handle(event)
                        }
                        if(isPlus && input.innerHTML.indexOf('-') == 0) {
                            input.innerHTML = input.innerHTML.replace('-', '')
                            handle(event)
                        }
                    }
                }
                handle = (event)=>{
                    // Ensure minus is leading
                    let value = input.innerHTML
                    if(value.indexOf('-') > 0) {
                        input.innerHTML = '-'+value.replace('-', '')
                    }
                    // Clamp to optional range
                    let num = parseFloat(input.innerHTML)
                    if(range) {
                        if(num < thisTypeValues.range[0]) input.innerHTML = `${thisTypeValues.range[0]}`
                        if(num > thisTypeValues.range[1]) input.innerHTML = `${thisTypeValues.range[1]}`
                        num = parseFloat(input.innerHTML)
                        if(range && event.type != 'skip') range.value = input.innerHTML
                    }
                    // Handle
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

        /**
         * This number should have a range slider.
         */
        if(range) {
            range.type = 'range'
            range.min = `${thisTypeValues.range[0]}`
            range.max = `${thisTypeValues.range[1]}`
            range.step = `${thisTypeValues.range[2]}`
            range.value = `${options.data}`
            
            input.classList.add('number-range')
            const maxLength = Math.max(range.min.length, range.max.length)
            input.style.width = `${maxLength}ch`

            range.oninput = (event)=>{
                input.innerHTML = range?.value ?? '0'
                handle(new Event('skip'))
            }
            newRoot.appendChild(range)
        }

        /*
         * An Enum class will have a select showing all the valid options.
         */
        if(thisTypeValues.option || parentTypeValues.option) {
            input.contentEditable = 'false'
            input.classList.add('disabled')
            if(this._config.hideIDs) input.classList.add('hidden')
            const enumClass = thisTypeValues.option
                ? thisTypeValues.class // Single enum
                : parentTypeValues.class  // List of enums
            const enumPrototype = OptionsMap.getPrototype(enumClass)
            const enumMeta = OptionsMap.getMeta(enumClass)
            if(enumMeta && enumPrototype) {
                const enumSelect = document.createElement('select') as HTMLSelectElement
                for(const [enumKey,enumValue] of Object.entries(enumPrototype)) {
                    const option = document.createElement('option') as HTMLOptionElement
                    option.value = enumValue
                    option.innerHTML = Utils.camelToTitle(enumKey)
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
                    const labelField = values.useLabel ? await DataMap.getMeta(values.class)?.label : undefined
                    items = await DataBaseHelper.loadIDsWithLabelForClass(values.class, labelField, isGeneric ? this._rowId : undefined)
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
                const items = DataMap.getNames(values.genericLike, true)
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
                        const meta = DataMap.getMeta(clazz)
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
                    let link = `editor.php?m=1&id=${selectIDs.value}&pp=${this._rowId}`
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

        /*
         * This is if we are picking a file
         */
        if(thisTypeValues.file.length || parentTypeValues.file.length) {
            input.contentEditable = 'false'
            input.classList.add('disabled')
            input.classList.add('hidden') // Always hidden as it can get long.

            const files = await AssetsHelper.get('', thisTypeValues.file.length ? thisTypeValues.file : parentTypeValues.file)
            const id = `${thisType}-datalist`
            const inputFile: HTMLInputElement = document.createElement('input') as HTMLInputElement
            inputFile.setAttribute('list', id)
            const value = Utils.escapeHTML(`${options.data}`)
            inputFile.value = value
            inputFile.title = value
            inputFile.size = 32
            const datalist: HTMLDataListElement = document.createElement('datalist') as HTMLDataListElement
            datalist.id = id
            for(const file of files) {
                const option = document.createElement('option') as HTMLOptionElement
                option.value = file
                datalist.appendChild(option)
            }
            inputFile.oninput = async(event)=>{
                const filePath = inputFile.value
                input.innerHTML = filePath
                inputFile.title = filePath
                updatePreview(this._config).then()
                handle(event)
            }
            newRoot.appendChild(inputFile)
            newRoot.appendChild(datalist)
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
        const isList = options.origin == EOrigin.ListArray || options.origin == EOrigin.ListDictionary

        // Sort out type values for ID references
        const thisType = options.instanceMeta?.types ? options.instanceMeta.types[pathKey] ?? '' : ''
        const thisTypeValues = DataUtils.parseRef(thisType)
        const instanceType = instance.constructor.name

        if(options.originListCount > 1) this.appendDragButton(newRoot, options.origin, options.path)

        if(isRoot) { // Root object generates a key field
            const bookmarkButton = document.createElement('button') as HTMLButtonElement
            bookmarkButton.innerHTML = '⭐'
            bookmarkButton.classList.add('inline-button')
            const toggleFavorite = async(event: Event)=>{
                const tag = await prompt('Set a bookmark title for this object')
                if(tag && tag.length > 0) {
                    const favorite = new ConfigEditorFavorite()
                    favorite.class = this._instance.constructor.name
                    favorite.class_withKey = this._key
                    this._config.favorites[tag] = favorite
                    await DataBaseHelper.saveMain(this._config)
                }
            }
            bookmarkButton.onclick = toggleFavorite
            bookmarkButton.ontouchstart = toggleFavorite

            const optionsClone = Utils.clone(options)
            optionsClone.root = options.root
            optionsClone.extraChildren = options.extraChildren
            optionsClone.extraChildren.push(bookmarkButton)
            optionsClone.data = `${options.key ?? ''}`
            optionsClone.origin = EOrigin.Single
            await this.buildField(EJsonEditorFieldType.String, optionsClone)
        } else {
            // A dictionary has editable keys
            if(options.origin == EOrigin.ListDictionary) {
                const keyInput = document.createElement('code') as HTMLSpanElement
                keyInput.contentEditable = 'false'
                keyInput.innerHTML = pathKey.toString()
                const editKey = (event: Event)=>{
                    this.promptForKey(options.path)
                }
                keyInput.onclick = editKey
                keyInput.ontouchstart = editKey
                newRoot.appendChild(keyInput)
            }
            // An array has a fixed index
            else {
                const strongSpan = document.createElement('strong') as HTMLSpanElement
                strongSpan.classList.add('list-title')
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

        // TODO: thisType is often WRONG, why does this work when that is the case. Need to understand this.
        //  The below does not actually work... so what the cheese.
        // if(thisTypeValues.class && DataObjectMap.hasInstance(thisTypeValues.class)) { // For lists class instances
        //     newInstanceMeta = isList ? options.instanceMeta : DataObjectMap.getMeta(thisTypeValues.class) ?? options.instanceMeta

        if(thisType && DataMap.hasInstance(thisType)) { // For lists class instances
            newInstanceMeta = DataMap.getMeta(thisType) ?? options.instanceMeta
        } else if (instanceType && DataMap.hasInstance(instanceType)) { // For single class instances
            newInstanceMeta = DataMap.getMeta(instanceType) ?? options.instanceMeta
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
            span.innerHTML = '✋'
            span.title = 'Drag & drop in list'
            span.classList.add('drag-icon')
            span.draggable = true
            span.ondragstart = (event)=>{
                span.style.cursor = 'grabbing'
                if(event.dataTransfer) {
                    event.dataTransfer.setData('application/json', JSON.stringify(path))
                    event.dataTransfer.effectAllowed = 'move'
                }
                const parent = span.parentElement?.parentElement
                document.querySelectorAll('.drag-icon').forEach(icon => {
                    if(icon != span && parent && icon.parentElement?.parentElement === parent) {
                        icon.innerHTML = '🖐'
                        icon.classList.add('drag-target')
                    }
                })
                span.innerHTML = '✊'
            }
            span.ondragenter = (event)=>{
                if(event.dataTransfer) event.dataTransfer.dropEffect = 'move'
            }
            span.ondragover = (event)=>{
                event.preventDefault() // Apparently we need to do this to allow for the drop to happen.
            }
            span.ondragend = (event)=>{
                document.querySelectorAll('.drag-icon').forEach(icon => {
                    icon.innerHTML = '✋'
                    icon.classList.remove('drag-target')
                })
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
    private appendNewReferenceItemButton(element: HTMLElement, typeValues: DataRefValues, path: IJsonEditorPath, parentId?: number): Function {
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
            button.classList.add('inline-button', 'save-button')
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

    private appendDocumentationIcon(element: HTMLElement, keyValue: string|number, instanceMeta: DataMeta|undefined) {
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
     * Handle values to update in the JSON structure.
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
            || this._parentId != this._originalParentId
        if(dirty != this._dirty) {
            this._modifiedStatusListener(dirty)
            this._dirty = dirty
            const topLI = this._root?.querySelector('li')
            if(dirty) {
                if(topLI) topLI.classList.add(this.MODIFIED_CLASS)
            } else {
                if(topLI) topLI.classList.remove(this.MODIFIED_CLASS)
            }
        }
    }

    getData(): IJsonEditorData {
        return {
            parentId: this._parentId,
            instance: this._instance
        }
    }
    getOriginalData(): any {
        return this._originalInstance
    }
    async setData(data: any, resetOriginalKeyAndParentId: boolean = false) {
        if(resetOriginalKeyAndParentId) {
            this._key = this._originalKey
            this._parentId = this._originalParentId
        }
        const freshInstance = await DataMap.getInstance(this._originalInstanceType, data)
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

    private async appendAddButton(newRoot: HTMLLIElement, typeValues: DataRefValues, instance: object, path: IJsonEditorPath) {
        if(typeValues.class.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = async (event)=>{
                if(Array.isArray(instance)) {
                    switch(typeValues.class) {
                        case 'number': instance.push(0); break
                        case 'boolean': instance.push(false); break
                        case 'string': instance.push(''); break
                        default:
                            if(typeValues.isIdReference) {
                                instance.push(0)
                                break
                            }
                            if(DataMap.hasInstance(typeValues.class)) {
                                const newInstance = await DataMap.getInstance(typeValues.class, undefined)
                                if(newInstance) instance.push(await newInstance.__clone()) // For some reason this would do nothing unless cloned.
                            } else if(OptionsMap.hasPrototype(typeValues.class)) {
                                const enumPrototype = await OptionsMap.getPrototype(typeValues.class)
                                if(enumPrototype) instance.push(enumPrototype)
                            }
                            else console.warn('Unhandled type:', typeValues.class, ' from value: ', typeValues.original)
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
                                if(DataMap.hasInstance(typeValues.class)) {
                                    const newInstance = await DataMap.getInstance(typeValues.class, undefined)
                                    if(newInstance) (instance as any)[newKey] = await newInstance.__clone()
                                } else if(OptionsMap.hasPrototype(typeValues.class)) {
                                    const enumPrototype = OptionsMap.getPrototype(typeValues.class)
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