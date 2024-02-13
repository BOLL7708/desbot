import {IDictionary} from '../../Interfaces/igeneral.js'

export default class EditorBus {
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
}