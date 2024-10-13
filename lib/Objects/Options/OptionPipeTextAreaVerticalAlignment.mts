import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionPipeTextAreaVerticalAlignment extends AbstractOption {
    static readonly Top = 'Top'
    static readonly Center = 'Center'
    static readonly Bottom = 'Bottom'
}
OptionsMap.addPrototype({
    prototype: OptionPipeTextAreaVerticalAlignment,
    description: 'The vertical alignment of the text inside the bounding box.',
    documentation: {}
})