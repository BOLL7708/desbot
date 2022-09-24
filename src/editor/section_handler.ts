import Utils from '../widget/utils.js'

type TSection =
    'Loading'
    | 'Waiting'
    | 'Register'
    | 'Login'
    | 'DBSetup'
    | 'Editor'
    | 'Twitch'
    | 'ImportSettings'
    | 'SettingsBrowser'

export default class SectionHandler {
    private static sectionElements: Record<TSection, HTMLDivElement | undefined> = {
        'Loading': SectionHandler.getSectionElement('Loading'),
        'Waiting': SectionHandler.getSectionElement('Waiting'),
        'Register': SectionHandler.getSectionElement('Register'),
        'Login': SectionHandler.getSectionElement('Login'),
        'DBSetup': SectionHandler.getSectionElement('DBSetup'),
        'Editor': SectionHandler.getSectionElement('Editor'),
        'Twitch': SectionHandler.getSectionElement('Twitch'),
        'ImportSettings': SectionHandler.getSectionElement('ImportSettings'),
        'SettingsBrowser': SectionHandler.getSectionElement('SettingsBrowser')
    }

    static init() {
        // Show loading
        SectionHandler.show('Loading')

        // Unhide container
        const container = document.querySelector<HTMLDivElement>('#container')
        if (container) container.style.display = 'block'
    }

    static show(sectionName: TSection) {
        for (const [name, section] of Object.entries(SectionHandler.sectionElements) as [TSection, HTMLDivElement | null][]) {
            if (section) section.style.display = name == sectionName ? 'block' : 'none'
        }
    }

    static get(sectionName: TSection): HTMLDivElement|undefined {
        return this.sectionElements[sectionName] ?? this.getSectionElement(sectionName)
    }

    private static getSectionElement(section: TSection): HTMLDivElement | undefined {
        return Utils.getElement<HTMLDivElement>(`#section${section}`) ?? undefined
    }
}

