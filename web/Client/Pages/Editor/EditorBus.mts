import {IDictionary} from '../../../Shared/Interfaces/igeneral.mts'

export default class EditorBus {
    // region Option that decides visibility
    static optionsForVisibility: IDictionary<IDictionary<HTMLElement>> = {}
    static registerVisibleForOption(property: string, value: number|string, element: HTMLElement) {
        if(!this.optionsForVisibility.hasOwnProperty(property)) this.optionsForVisibility[property] = { [value.toString()]: element }
        else this.optionsForVisibility[property][value.toString()] = element
    }
    static clearVisibleForOptionEntries() {
        this.optionsForVisibility = {}
    }
    static setVisibleForOption(property: string, matchValue: number|string) {
        const valueToElement = this.optionsForVisibility[property]
        if(valueToElement) {
            for(const [value, element] of Object.entries(valueToElement)) {
                if(matchValue.toString() == value.toString()) element.classList.remove('hidden')
                else element.classList.add('hidden')
            }
        }
    }
    // endregion

    // region Toggles for visibility
    static toggleVisibility: IDictionary<HTMLElement> = {}
    static registerToggleVisibilityByElement(property: string, element: HTMLElement) {
        this.toggleVisibility[property] = element;
    }
    static clearToggleVisibilityEntries() {
        this.toggleVisibility = {}
    }

    /**
     * Used to toggle things when clicking the registered element.
     * @param property
     * @param visible
     */
    static toggleVisibilityByElement(property: string, visible: boolean) {
        const propertyToElement = this.toggleVisibility[property]
        this.toggleAllSiblings(propertyToElement, visible)
    }

    /**
     * Used to toggle things on building the editor, doesn't need anything to be clicked.
     * @param onLabel
     */
    static toggleVisibilityForAllEntries(onLabel: string) {
        for(const element of Object.values(this.toggleVisibility)) {
            const isOn = element.innerHTML == onLabel
            this.toggleAllSiblings(element, isOn)
        }
    }
    private static toggleAllSiblings(element: HTMLElement|undefined, visible: boolean) {
        if(!element) return
        const parent = element?.parentElement
        if(!parent) return
        const parentSiblings = Object.values(parent.parentElement?.children ?? {})
        if(!parentSiblings.length) return

        for(const sibling of parentSiblings) {
            if(parent !== sibling) {
                if(visible) sibling.classList.remove('hidden')
                else sibling.classList.add('hidden')
            }
        }
    }
    // endregion
}