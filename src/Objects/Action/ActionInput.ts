import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionCommandType} from '../../Options/OptionCommandType.js'

export class ActionInput extends Data{
    window: string = ''
    commands: ActionInputCommand[] = []
    type = OptionCommandType.Keys
    duration: number = 0
    postfixEnterStroke: boolean = false

    register() {
        DataMap.addRootInstance(
            new ActionInput(),
            'Execute a virtual input sequence in a specific desktop window using AutoIt v3, see links for setup.',
            {
                window: 'The title of the window to send the key press to.',
                commands: 'A list of commands to execute.',
                type: 'Type of execution',
                duration: 'Seconds before running an optional reset to default, if defined in the command.',
                postfixEnterStroke: 'Press enter at the end of every command, useful for console commands.'
            },
            {
                commands: ActionInputCommand.ref(),
                type: OptionCommandType.ref()
            }
        )
    }
}

export class ActionInputCommand extends Data {
    command: string[] = []
    value: string = ''
    defaultValue: string = ''

    register() {
        DataMap.addSubInstance(
            new ActionInputCommand(),
            {
                command: 'Full command(s).',
                value: 'Value to append, make sure to supply this if you are planning to reset to default.',
                defaultValue: 'Will reset to this if value and this is provided.'
            },
            {
                command: 'string'
            }
        )
    }
}


