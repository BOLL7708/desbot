import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

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