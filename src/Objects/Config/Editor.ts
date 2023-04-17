import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigEditor extends BaseDataObject {
    autoGenerateKeys: boolean = true
    autoGenerateKeys_andShorten: boolean = true
    showHelpIcons: boolean = true
    hideIDs: boolean = true
    hideBooleanNames: boolean = true
    includeOrphansInGenericLists: boolean = true
    favorites: {[key: string]: number} = {}
}

DataObjectMap.addRootInstance(
    new ConfigEditor(),
    'Configuration values for this very editor that you are using right now.',
    {
        autoGenerateKeys: 'Will automatically generate keys for new entries based on type and parent type.',
        showHelpIcons: 'Will display the help icon next to entries if documentation exists.',
        hideIDs: 'Will hide the table row IDs in the editor, turn this on to reduce clutter.',
        hideBooleanNames: 'Will hide "True" and "False" from boolean switches.',
        includeOrphansInGenericLists: 'In generic lists we by default parent new child items to the current main item, if this is active the dropdown in the editor will also include items in the system without a parent.',
        favorites: 'IDs to favorites in the favorites bar, only a soft reference not depending on the existence of the referenced item.'
    },
    {
        favorites: 'number'
    }
)