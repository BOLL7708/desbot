import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigEditor extends BaseDataObject {
    showHelpIcons: boolean = true
    hideIDs: boolean = true
    includeOrphansInGenericLists: boolean = true
}

DataObjectMap.addRootInstance(
    new ConfigEditor(),
    'Configuration values for this very editor that you are using right now.',
    {
        showHelpIcons: 'Will display the help icon next to entries if documentation exists.',
        hideIDs: 'Will hide the table row IDs in the editor, turn this on to reduce clutter.',
        includeOrphansInGenericLists: 'In generic lists we by default parent new child items to the current main item, if this is active the dropdown in the editor will also include items in the system without a parent.'
    }
)