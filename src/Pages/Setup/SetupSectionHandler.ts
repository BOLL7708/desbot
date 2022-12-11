import Utils from '../../Classes/Utils.js'

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

export default class SetupSectionHandler {
    private static sectionElements: Record<TSection, HTMLDivElement | undefined> = {
        'Loading': SetupSectionHandler.getSectionElement('Loading'),
        'Waiting': SetupSectionHandler.getSectionElement('Waiting'),
        'Register': SetupSectionHandler.getSectionElement('Register'),
        'Login': SetupSectionHandler.getSectionElement('Login'),
        'DBSetup': SetupSectionHandler.getSectionElement('DBSetup'),
        'Editor': SetupSectionHandler.getSectionElement('Editor'),
        'TwitchClient': SetupSectionHandler.getSectionElement('TwitchClient'),
        'TwitchLoginChannel': SetupSectionHandler.getSectionElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': SetupSectionHandler.getSectionElement('TwitchLoginChatbot'),
        'ImportSettings': SetupSectionHandler.getSectionElement('ImportSettings'),
        'SettingsBrowser': SetupSectionHandler.getSectionElement('SettingsBrowser')
    }

    static init() {
        // Show loading
        SetupSectionHandler.show('Loading').then()

        // Unhide container
        const contentDiv = document.querySelector('#content') as HTMLDivElement
        if (contentDiv) contentDiv.style.display = 'block'
    }

    static async show(sectionName: TSection, titleOverride?: string, messageOverride?: string): Promise<boolean> {
        for (const [name, section] of Object.entries(SetupSectionHandler.sectionElements) as [TSection, HTMLDivElement | null][]) {
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

