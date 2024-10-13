import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionPipeEasingType extends AbstractOption {
    static readonly Linear = 'Linear'
    static readonly Sine = 'Sine'
    static readonly Quad = 'Quad'
    static readonly Cubic = 'Cubic'
    static readonly Quart = 'Quart'
    static readonly Quint = 'Quint'
    static readonly Expo = 'Expo'
    static readonly Circ = 'Circ'
    static readonly Back = 'Back'
    static readonly Elastic = 'Elastic'
    static readonly Bounce = 'Bounce'
}
OptionsMap.addPrototype({
    prototype: OptionPipeEasingType,
    description: 'The easing type for the animation.',
    documentation: {}
})