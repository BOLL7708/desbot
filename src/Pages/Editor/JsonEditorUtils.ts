import {DataRefValues} from '../../Objects/Data.js'
import {DataMeta} from '../../Objects/DataMeta.js'
import JsonEditor, {EOrigin, IJsonEditorPath} from './JsonEditor.js'
import DataMap from '../../Objects/DataMap.js'
import Utils from '../../Classes/Utils.js'
import {OptionsMap} from '../../Options/OptionsMap.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'

export class JsonEditorUtils {
    // region Append elements
    static appendPartnerFieldSlot(editor: JsonEditor, parent: HTMLElement, clazz: string, key: string) {
        const partnerSlot = document.createElement('span') as HTMLSpanElement
        partnerSlot.id = editor.getPartnerSlotID(clazz, key)
        parent.appendChild(partnerSlot)
    }

    /**
     * Adds the button but also returns a lambda that can update the link of the button to lead to a different class.
     * @param editor
     * @param parent
     * @param typeValues
     * @param path // Only include the path if the item is supposed to be replaced with the new one.
     * @param key
     * @param parentId // Add parent IDs for generic items that should belong to a single parent.
     * @private
     */
    static appendNewReferenceItemButton(editor: JsonEditor, parent: HTMLElement, typeValues: DataRefValues, path: IJsonEditorPath, key: string, parentId?: number): Function {
        let button: HTMLButtonElement|undefined = undefined
        const updateLink = (clazz: string)=>{
            if(button) {
                button.title = `Create new item of type: ${clazz}`+(parentId ? ` for parent: ${key} (${parentId})` : '')
                button.onclick = (event)=>{
                    let link = `editor.php?c=${clazz}&m=1&n=1`
                    if(parentId) link += `&p=${parentId}`
                    editor.openChildEditor(link, path)
                }
            }
        }
        if(typeValues.class && typeValues.isIdReference) {
            button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '👶'
            button.classList.add('inline-button', 'save-button')
            button.tabIndex = -1
            updateLink(typeValues.class)
            parent.appendChild(button)
        }
        return updateLink
    }

    static appendRemoveButton(editor: JsonEditor, parent: HTMLElement, origin: EOrigin, path: IJsonEditorPath, label: HTMLElement|undefined) {
        if(origin == EOrigin.ListArray || origin == EOrigin.ListDictionary) {
            const button = document.createElement('button') as HTMLButtonElement
            button.innerHTML = '💥'
            button.title = 'Remove item'
            button.classList.add('inline-button', 'delete-button')
            button.tabIndex = -1
            button.onclick = async (event)=>{
                editor.handleValue(null,  path, label)
                await editor.rebuild()
            }
            parent.appendChild(button)
        }
    }

    static appendDocumentationIcon(parent: HTMLElement, keyValue: string|number, showHelpIcons: boolean, instanceMeta: DataMeta|undefined) {
        const key = keyValue.toString()
        const docStr = (instanceMeta?.documentation ?? {})[key] ?? ''
        if(docStr.length > 0 && showHelpIcons) {
            const span = document.createElement('span') as HTMLSpanElement
            span.classList.add('documentation-icon')
            span.innerHTML = '💬'
            span.title = docStr
            parent.appendChild(span)
        }
    }

    static appendDragButton(editor: JsonEditor, parent: HTMLElement, origin: EOrigin, path: (string | number)[]) {
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
                        await editor.handleArrayMove(fromPath, path)
                    } else if(origin == EOrigin.ListDictionary) {
                        await editor.handleDictionaryMove(fromPath, path)
                    }
                }
            }
            parent.appendChild(span)
        }
    }

    static async appendAddButton(editor: JsonEditor, parent: HTMLLIElement, typeValues: DataRefValues, instance: string|number|boolean|object, path: IJsonEditorPath) {
        if(typeValues.class.length > 0) {
            const newButton = document.createElement('button') as HTMLButtonElement
            newButton.innerHTML = '✨'
            newButton.title = 'Add new item'
            newButton.classList.add('inline-button', 'new-button')
            newButton.onclick = async (event)=>{
                if(Array.isArray(instance)) {
                    switch(typeValues.type.length ? typeValues.type : typeValues.class) {
                        case 'number': instance.push(0); break
                        case 'boolean': instance.push(false); break
                        case 'string': instance.push(''); break
                        default:
                            if(typeValues.isIdReference) {
                                instance.push(0)
                                break
                            }
                            if(DataMap.hasInstance(typeValues.class)) {
                                const newInstance = await DataMap.getInstance({ className: typeValues.class, fill: false })
                                if(newInstance) instance.push(Utils.clone(newInstance)) // For some reason this would do nothing unless cloned.
                            } else if(OptionsMap.hasPrototype(typeValues.class)) {
                                const enumPrototype = await OptionsMap.getPrototype(typeValues.class)
                                if(enumPrototype) instance.push(enumPrototype)
                            }
                            else console.warn('Unhandled type:', typeValues.class, ' from value: ', typeValues.original)
                    }
                    editor.handleValue(instance, path, parent)
                    await editor.rebuild()
                } else {
                    const newKey = prompt(`Provide an explanatory name (key) for the new ${typeValues.class}:`)
                    if(newKey && newKey.length > 0) {
                        switch(typeValues.type.length ? typeValues.type : typeValues.original) {
                            case 'number': (instance as any)[newKey] = 0; break
                            case 'boolean': (instance as any)[newKey] = false; break
                            case 'string': (instance as any)[newKey] = ''; break
                            default:
                                if(typeValues.isIdReference) {
                                    (instance as any)[newKey] = 0
                                    break
                                }
                                if(DataMap.hasInstance(typeValues.class)) {
                                    const newInstance = await DataMap.getInstance({ className: typeValues.class, fill: false })
                                    if(newInstance) (instance as any)[newKey] = Utils.clone(newInstance)
                                } else if(OptionsMap.hasPrototype(typeValues.class)) {
                                    const enumPrototype = OptionsMap.getPrototype(typeValues.class)
                                    if(enumPrototype) (instance as any)[newKey] = enumPrototype
                                }
                                else console.warn('Unhandled type:', typeValues.class)
                        }
                        editor.handleValue(instance, path, parent)
                        await editor.rebuild()
                    }
                }
            }
            parent.appendChild(newButton)
        }
    }

    static getBookmarkButton(callback: (event: Event)=>{}): HTMLButtonElement {
        const bookmarkButton = document.createElement('button') as HTMLButtonElement
        bookmarkButton.innerHTML = '⭐'
        bookmarkButton.title = 'Add a bookmark to the bookmarks bar to easily access this page again later.'
        bookmarkButton.classList.add('inline-button')
        bookmarkButton.onclick = callback
        bookmarkButton.ontouchstart = callback
        return bookmarkButton
    }

    static appendInstructions(parent: HTMLElement, meta: DataMeta|undefined, key: string) {
        if(meta?.instructions && meta.instructions.hasOwnProperty(key)) {
            const instruction = meta.instructions[key]
            const paragraph = document.createElement('p') as HTMLParagraphElement
            paragraph.classList.add('instructions')
            paragraph.innerHTML = instruction
            parent.appendChild(paragraph)
        }
    }
    // endregion
}