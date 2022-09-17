import Utils from '../widget/utils.js'

type TSection =
    'Register'
    | 'Login'
    | 'DBSetup'

export default class SectionHandler {
    private static sectionElements: Record<TSection, HTMLDivElement|null> = {
        'Register': SectionHandler.getSectionElement('Register'),
        'Login': SectionHandler.getSectionElement('Login'),
        'DBSetup': SectionHandler.getSectionElement('DBSetup')
    }
    static init() {
        // TODO: Detect what to show and start flow here.
        // TODO: It should, if all prerequisites exists, launch the full page.

        // Toggle sections
        SectionHandler.show('Register')

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

