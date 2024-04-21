import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {OptionCommandType} from '../../Options/OptionCommandType.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import AbstractData from '../AbstractData.js'

export default class ActionInput extends AbstractAction {
    window: string = ''
    type = OptionCommandType.Keys
    duration: number = 0
    commands: ActionInputCommand[] = [new ActionInputCommand()]
    commands_use = OptionEntryUsage.All
    postfixEnterStroke: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionInput(),
            tag: '⌨️',
            description: 'Execute a virtual input sequence in a specific desktop window using AutoIt v3, see links for setup.',
            documentation: {
                window: 'The title of the window to send the key press to.',
                type: 'Type of execution',
                duration: 'Seconds before running an optional reset to default, if defined in the command.',
                commands: 'A list of commands to execute.',
                postfixEnterStroke: 'Press enter at the end of every command, useful for console commands.'
            },
            types: {
                type: OptionCommandType.ref,
                commands: ActionInputCommand.ref.build(),
                commands_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Objects/Data/ActionInputRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionInput>(key, this)
    }
}

export class ActionInputCommand extends AbstractData {
    command: string = ''
    value: string = ''
    defaultValue: string = ''

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionInputCommand(),
            documentation: {
                command: 'Text command with or without value.\nIf keys it will be typed in the window.\nIf mouse provide a string with any combination of these characters:\nu: mouse wheel up\nd: mouse wheel down\nl: left mouse button\nr: right mouse button\np: primary mouse button\ns: secondary mouse button',
                value: 'Value to append if you want a reset after a duration, if so also set the default value.',
                defaultValue: 'Will reset to this if value and this and a duration is provided.'
            }
        })
    }
}


