import Utils from '../widget/utils.js'

type TSection =
    'Loading'
    | 'Register'
    | 'Login'
    | 'DBSetup'
    | 'Editor'

export default class SectionHandler {
    private static sectionElements: Record<TSection, HTMLDivElement|null> = {
        'Loading': SectionHandler.getSectionElement('Loading'),
        'Register': SectionHandler.getSectionElement('Register'),
        'Login': SectionHandler.getSectionElement('Login'),
        'DBSetup': SectionHandler.getSectionElement('DBSetup'),
        'Editor': SectionHandler.getSectionElement('Editor')
    }
    static init() {
        // Show loading
        SectionHandler.show('Loading')

        // Unhide container
        const container = document.querySelector<HTMLDivElement>('#container')
        if(container) container.style.display = 'block'
    }
    static show(sectionName: TSection) {
        for(const [name, section] of Object.entries(SectionHandler.sectionElements) as [TSection, HTMLDivElement|null][]) {
            if(section) section.style.display = name == sectionName ? 'block' : 'none'
        }
    }

    private static getSectionElement(section: TSection): HTMLDivElement|null
    {
        return Utils.getElement<HTMLDivElement>(`#section${section}`)
    }
}

