import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {DataUtils} from '../DataUtils.js'

export class ConfigEditor extends Data {
    autoGenerateKeys: boolean = true
    autoGenerateKeys_andShorten: boolean = true
    showHelpIcons: boolean = true
    hideIDs: boolean = true
    hideBooleanNames: boolean = true
    includeOrphansInGenericLists: boolean = true
    askToRevealSecretInput: boolean = true
    showFavoritesBar: boolean = true
    audioPreviewVolume: number = 100
    favorites: { [key:string]: ConfigEditorFavorite } = {}

    enlist() {
        DataMap.addRootInstance(
            new ConfigEditor(),
            'Configuration values for this very editor that you are using right now.',
            {
                autoGenerateKeys: 'Will automatically generate keys for new entries based on type and parent type.',
                showHelpIcons: 'Will display the help icon next to entries if documentation exists.',
                hideIDs: 'Will hide the table row IDs in the editor, turn this on to reduce clutter.',
                hideBooleanNames: 'Will hide "True" and "False" from boolean switches.',
                askToRevealSecretInput: 'Will ask to show and edit a field that is otherwise censored.',
                includeOrphansInGenericLists: 'In generic lists we by default parent new child items to the current main item, if this is active the dropdown in the editor will also include items in the system without a parent.',
                showFavoritesBar: 'Show the bar with favorites.',
                audioPreviewVolume: 'The volume to use when previewing audio in percent.',
                favorites: 'IDs to favorites in the favorites bar, only a soft reference not depending on the existence of the referenced item.'
            },
            {
                audioPreviewVolume: DataUtils.getNumberRangeRef(1, 100),
                favorites: ConfigEditorFavorite.ref()
            }
        )
    }
}
export class ConfigEditorFavorite extends Data {
    class: string = ''
    class_withKey: string = ''

    enlist() {
        DataMap.addSubInstance(
            new ConfigEditorFavorite(),
            {
                class: 'Class and key of the favorite.'
            }
        )
    }
}