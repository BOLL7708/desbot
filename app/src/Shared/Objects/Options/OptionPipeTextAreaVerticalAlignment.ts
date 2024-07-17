import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeTextAreaVerticalAlignment extends AbstractOption {
    static readonly Left = 'Top'
    static readonly Center = 'Center'
    static readonly Right = 'Bottom'
}
OptionsMap.addPrototype({
    prototype: OptionPipeTextAreaVerticalAlignment,
    description: 'The vertical alignment of the text inside the bounding box.',
    documentation: {}
})