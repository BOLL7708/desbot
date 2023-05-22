import Utils from '../Classes/Utils.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'
import DataUtils from '../Classes/DataUtils.js'
import {ConfigEditor} from '../Objects/Config/Editor.js'

export default class TopBar {
    static attachSignOutClick(elementId: string) {
        const a = document.querySelector<HTMLLinkElement>(elementId)
        if(a) {
            function signOut(e: Event) {
                Utils.clearAuth()
            }
            a.onclick = signOut
            a.ontouchstart = signOut
        }
    }
    static attachPageModeClick(elementId: string) {
        const a = document.querySelector<HTMLLinkElement>(elementId)
        if(a) {
            const dataFile = 'page_mode.json'
            const styleTag = document.querySelector<HTMLLinkElement>('#link-page-mode-stylesheet')
            async function togglePageMode() {
                if(styleTag) {
                    const currentMode = Utils.toBool(await DataUtils.readData(dataFile))
                    await DataUtils.writeData(dataFile, currentMode ? 0 : 1)
                    styleTag.href = `./styles/_${currentMode ? 'bright' : 'dark'}.css`
                }
            }
            a.onclick = togglePageMode
            a.ontouchstart = togglePageMode
        }
    }
    static async attachFavorites(elementId: string) {
        const div = document.querySelector<HTMLDivElement>(elementId)
        if(div) {
            if(window.location.pathname.includes('index.php')) {
                div.style.display = 'none'
            } else {
                const editorConfig = await DataBaseHelper.loadMain(new ConfigEditor())
                const favorites = editorConfig.favorites
                const items: HTMLElement[] = [buildFavorite('🔨 Config', 'ConfigEditor', DataBaseHelper.OBJECT_MAIN_KEY, 'editor.php?g=c&c=ConfigEditor&k=Main')]
                if(Object.keys(favorites).length > 0) {
                    for(const [name, favorite] of Object.entries(favorites)) {
                        items.push(buildFavorite(`⭐ ${name}`, favorite.class, favorite.class_withKey))
                    }
                }
                const ul = document.createElement('ul') as HTMLUListElement
                ul.replaceChildren(...items)
                div.replaceChildren(ul)
            }
        }

        function buildFavorite(name: string, groupClass: string, groupKey: string, url?: string): HTMLSpanElement {
            const li = document.createElement('li') as HTMLLIElement
            const a = document.createElement('a') as HTMLAnchorElement
            a.href = url ?? `editor.php?c=${groupClass}&k=${groupKey}`
            a.innerHTML = name
            li.appendChild(a)
            return li
        }
    }
}