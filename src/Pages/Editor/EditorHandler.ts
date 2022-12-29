import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import Utils from '../../Classes/Utils.js'

export default class EditorHandler {
    private readonly _likeFilter: string|undefined
    public constructor(like: string) {
        this._likeFilter = like
        this.updateSideMenu().then()
    }

    private _sideMenuDiv: HTMLDivElement|undefined
    async updateSideMenu() {
        if(!this._sideMenuDiv) {
            this._sideMenuDiv = document.querySelector('#side-bar') as HTMLDivElement
        }
        const classesAndCounts = await DataBaseHelper.loadClasses(this._likeFilter ?? '')
        const title = document.createElement('h3') as HTMLHeadingElement
        title.innerHTML = 'List' // TODO: Customizable?
        this._sideMenuDiv.appendChild(title)
        for(const [group,count] of Object.entries(classesAndCounts)) {
            const link = document.createElement('span') as HTMLSpanElement
            const name = Utils.splitOnCaps(group).splice(1).join(' ')
            const a = document.createElement('a') as HTMLAnchorElement
            a.href = '#'
            a.innerHTML = `${name}</a>: <strong>${count}</strong>`
            a.onclick = (event: Event) => {
                if(event.cancelable) event.preventDefault()
                console.log(`Load index for setting class: ${group}`)
                this.showListOfItems(group).then()
            }
            link.appendChild(a)
            link.appendChild(document.createElement('br') as HTMLBRElement)
            this._sideMenuDiv.appendChild(link)

            // TODO: Do not try to instantiate classes, just use the JSON directly to
            //  spawn an editor with associated fields.

            // TODO: Make sure loading an array of data only loads entries WITHOUT a groupKey
            //  Make sure loading a dictionary of data only loads entries WITH a groupKey
        }
    }

    private async showListOfItems(group: string) {
        // TODO: We cannot load the settings here on group alone, as the current functions
        //  require a class instance to return something usable. I might have to rethink this
        //  database helper class, to have specific calls for converting to classes or not.
        // const items = await DataBaseHelper.loadSettingsDictionary()
        const items = await DataBaseHelper.loadFromDatabase(group)
        console.log(items)
    }
}