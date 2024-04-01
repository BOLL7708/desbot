import Utils from '../../../Shared/Classes/Utils.js'

type TSection =
    'Loading'
    | 'Waiting'
    | 'Register'
    | 'Login'
    | 'Editor'
    | 'TwitchClient'
    | 'TwitchLoginChannel'
    | 'TwitchLoginChatbot'
    | 'SettingsBrowser'

export default class SetupSectionHandler {
    private _sectionElements: Record<TSection, HTMLDivElement | undefined> = {
        'Loading': this.getSectionElement('Loading'),
        'Waiting': this.getSectionElement('Waiting'),
        'Register': this.getSectionElement('Register'),
        'Login': this.getSectionElement('Login'),
        'Editor': this.getSectionElement('Editor'),
        'TwitchClient': this.getSectionElement('TwitchClient'),
        'TwitchLoginChannel': this.getSectionElement('TwitchLoginChannel'),
        'TwitchLoginChatbot': this.getSectionElement('TwitchLoginChatbot'),
        'SettingsBrowser': this.getSectionElement('SettingsBrowser')
    }
    private _stepLabels: Partial<Record<TSection, string>> = {
        'Register': 'Register a password',
        'Login': 'Login if needed',
        'TwitchClient': 'Setup Twitch Client',
        'TwitchLoginChannel': 'Login Twitch channel',
        'TwitchLoginChatbot': 'Login Twitch chatbot'
    }

    constructor() {
        // Show loading
        this.show('Loading').then()

        // Unhide container
        const contentDiv = document.querySelector('#content') as HTMLDivElement
        if (contentDiv) contentDiv.style.display = 'block'
    }

    async show(sectionName: TSection, titleOverride?: string, messageOverride?: string): Promise<boolean> {
        this.updateSideMenu(sectionName)
        for (const [name, section] of Object.entries(this._sectionElements) as [TSection, HTMLDivElement | null][]) {
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

    get(sectionName: TSection): HTMLDivElement|undefined {
        return this._sectionElements[sectionName] ?? this.getSectionElement(sectionName)
    }

    getSectionElement(section: TSection): HTMLDivElement | undefined {
        return Utils.getElement<HTMLDivElement>(`#section${section}`) ?? undefined
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    private updateSideMenu(step: TSection) {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        const steps = Object.keys(this._stepLabels) as TSection[]
        if(this._sideMenuDiv && steps.indexOf(step) != -1) {
            let html = '<ol>'
            let done = true
            for(const s of steps) {
                const label = this._stepLabels[s]
                if(step == s) {
                    done = false
                    html += `<li><strong>${label} 👈</strong></li>`
                } else {
                    if(done) html += `<li>${label} 👍</li>`
                    else html += `<li>${label}</li>`
                }
            }
            html += '</ol>'
            this._sideMenuDiv.innerHTML = html
        }
    }
}

