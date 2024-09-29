import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

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