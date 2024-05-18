import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionMoveVRSpaceEasingType extends AbstractOption {
    static readonly linear = 'Linear'
    static readonly sine = 'Sine'
    static readonly quad = 'Quad'
    static readonly cubic = 'Cubic'
    static readonly quart = 'Quart'
    static readonly quint = 'Quint'
    static readonly expo = 'Expo'
    static readonly circ = 'Circ'
    static readonly back = 'Back'
    static readonly elastic = 'Elastic'
    static readonly bounce = 'Bounce'
}
OptionsMap.addPrototype({
    prototype: OptionMoveVRSpaceEasingType
})