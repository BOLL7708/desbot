import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeTextAreaHorizontalAlignment extends AbstractOption {
    static readonly Left = 'Left'
    static readonly Center = 'Center'
    static readonly Right = 'Right'
}
OptionsMap.addPrototype({
    prototype: OptionPipeTextAreaHorizontalAlignment,
    description: 'The horizontal alignment of the text inside the bounding box.',
    documentation: {}
})