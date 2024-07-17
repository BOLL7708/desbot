import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeEasingMode extends AbstractOption {
    static readonly In = 'In'
    static readonly Out = 'Out'
    static readonly InOut = 'InOut'
}
OptionsMap.addPrototype({
    prototype: OptionPipeEasingMode,
    description: 'The easing mode for the animation.',
    documentation: {}
})