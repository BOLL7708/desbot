import Utils from '../ClassesStatic/Utils.js'

type TSection =
    'Loading'
    | 'Waiting'
    | 'Register'
    | 'Login'
    | 'DBSetup'
    | 'Editor'
    | 'TwitchClient'
    | 'TwitchLoginChannel'
    | 'TwitchLoginChatbot'
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
        'TwitchClient': SectionHandler.getSectionElement('TwitchClient'),
        'TwitchLoginChannel': SectionHandler.getSectionElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': SectionHandler.getSectionElement('TwitchLoginChatbot'),
        'ImportSettings': SectionHandler.getSectionElement('ImportSettings'),
        'SettingsBrowser': SectionHandler.getSectionElement('SettingsBrowser')
    }

    static init() {
        // Show loading
        SectionHandler.show('Loading').then()

        // Unhide container
        const container = document.querySelector<HTMLDivElement>('#container')
        if (container) container.style.display = 'block'
    }

    static async show(sectionName: TSection, titleOverride?: string, messageOverride?: string): Promise<boolean> {
        for (const [name, section] of Object.entries(SectionHandler.sectionElements) as [TSection, HTMLDivElement | null][]) {
            if (section && name == sectionName) {
                if(titleOverride) {
                    const titleElement = section.querySelector('h2:first-of-type')
                    if(titleElement) titleElement.innerHTML = titleOverride
                }
                if(messageOverride) {
                    const messageElement = section.querySelector('p:first-of-type')
                    if(messageElement) messageElement.innerHTML = messageOverride
                }
                section.style.display = 'block'
            } else if (section) {
                section.style.display = 'none'
            }
        }
        if(titleOverride || messageOverride) await Utils.sleep(500)
        return true // This acts as async as popping a dialog after triggering this would prevent it from actually finishing on time.
    }

    static get(sectionName: TSection): HTMLDivElement|undefined {
        return this.sectionElements[sectionName] ?? this.getSectionElement(sectionName)
    }

    private static getSectionElement(section: TSection): HTMLDivElement | undefined {
        return Utils.getElement<HTMLDivElement>(`#section${section}`) ?? undefined
    }
}

