import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {ICommandPermissions} from '../../Interfaces/itwitch.js'
import {PresetPermissions} from '../Preset/Permissions.js'

export class TriggerCommand extends BaseDataObject {
    entries: string[] = []
    permissions = new PresetPermissions()
    requireUserTag = false
    requireExactWordCount: number = 0
    requireMinimumWordCount: number = 0
    helpTitle: string = ''
    helpInput: string[] = []
    helpText: string = ''
}

DataObjectMap.addRootInstance(new TriggerCommand(),
    'A chat command.',
    {
        entries: 'The commands that can be used with this trigger.',
        permissions: 'Permission for who can execute this command.',
        requireUserTag: 'Require this command to include a user tag to get triggered.',
        requireExactWordCount: 'Require this command to include exactly this number of words to get triggered.',
        requireMinimumWordCount: 'Require this command to include at least this number of words to get triggered.',
        helpTitle: 'A title that is used when posting all help to Discord, is inserted above this command.',
        helpInput: 'Input values for the command, used to build the help text.',
        helpText: 'Description that is used for help documentation.'
    },
    {
        entries: 'string',
        permissions: PresetPermissions.refId(),
        helpInput: 'string'
    }
)