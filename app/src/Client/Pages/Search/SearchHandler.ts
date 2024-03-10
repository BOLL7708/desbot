import Utils from '../../../Shared/Classes/Utils.js'
import DataBaseHelper from '../../../Shared/Classes/DataBaseHelper.js'

export default class SearchHandler {
    constructor() {
        this.init().then()
    }

    private async init() {
        const content = document.querySelector('#content') as HTMLDivElement
        const input = content.querySelector('#search') as HTMLInputElement
        const container = content.querySelector('#container') as HTMLDivElement
        const params = Utils.getUrlParams()
        if(input && params.has('q')) {
            input.value = Utils.decode(decodeURIComponent(params.get('q') ?? ''))
        }
        if (input) {
            input.onkeydown = async (event) => {
                if (event.key == 'Enter') {
                    const value = input.value.trim()
                    Utils.setUrlParam({q: Utils.encode(value)})
                    const table = document.createElement('table') as HTMLTableElement
                    const titleRow = document.createElement('tr') as HTMLTableRowElement
                    titleRow.appendChild(buildTD('<strong>ID</strong>'))
                    titleRow.appendChild(buildTD('<strong>Class</strong>'))
                    titleRow.appendChild(buildTD('<strong>Key</strong>'))
                    titleRow.appendChild(buildTD('<strong>Parent&nbsp;ID</strong>'))
                    titleRow.appendChild(buildTD('<strong>Data</strong>'))
                    table.appendChild(titleRow)
                    if(value.length > 0) {
                        const items = await DataBaseHelper.search(value)
                        for(const item of items) {
                            const tr = document.createElement('tr') as HTMLTableRowElement
                            tr.appendChild(buildTD(`<a href="editor.php?id=${item.id}">${item.id}</a>`))
                            tr.appendChild(buildTD(`${item.class}`))
                            tr.appendChild(buildTD(`${item.key}`))
                            tr.appendChild(buildTD(item.pid !== null ? `<a href="editor.php?id=${item.pid}">${item.pid}</a>` : ''))
                            tr.appendChild(buildTD(`${item.data}`))
                            table.appendChild(tr)
                        }
                    }
                    container.replaceChildren(table)
                }
            }
        }

        function buildTD(contents: string): HTMLTableCellElement {
            const td = document.createElement('td') as HTMLTableCellElement
            td.innerHTML = contents
            return td
        }
    }
}