import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import Utils from '../../Classes/Utils.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ExecUtils from '../../Classes/ExecUtils.js'
import TextHelper from '../../Classes/TextHelper.js'

export class ActionURI extends Action {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    delayMs: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionURI(),
            tag: '🔗',
            description: 'Loads http/https URLs or custom schema URIs silently in the background.',
            documentation: {
                entries: 'Full URIs including protocol.\n\nhttp:// and https:// will load as web URLs, while custom schemas [custom]:// will be executed as local system calls.',
                delayMs: 'Delay between URI loads, in milliseconds.'
            },
            types: {
                entries: 'string',
                entries_use: OptionEntryUsage.ref
            }
        })
    }

    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers a URI action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionURI>(this)
                const uris = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                let totalDelay = 0
                for(const uri of uris) {
                    if(clone.delayMs) {
                        totalDelay += clone.delayMs
                        setTimeout(()=>{ loadURI(uri).then() }, totalDelay)
                    } else {
                        loadURI(uri).then()
                    }
                }
                async function loadURI(uri: string) {
                    uri = await TextHelper.replaceTagsInText(uri.trim(), user)
                    if(uri.startsWith('http://') || uri.startsWith('https://')) {
                        await fetch(uri, {mode: 'no-cors'})
                        console.log(`ActionURI: Loaded URL: ${uri}`)
                    } else {
                        ExecUtils.loadCustomURI(uri)
                        console.log(`ActionURI: Loaded URI: ${uri}`)
                    }
                }
            }
        }
    }
}

