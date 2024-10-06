import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

export default class OptionMoveVRSpaceEasingType extends AbstractOption {
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
    prototype: OptionMoveVRSpaceEasingType,
    description: 'The easing type for the animation.',
    documentation: {
        linear: 'Linear, basically no effect.',
        sine: 'A sine wave.',
        quad: 'An x^2 curve.',
        cubic: 'An x^3 curve.',
        quart: 'An x^4 curve.',
        quint: 'An x^5 curve.',
        expo: 'An x^x curve.',
        circ: 'A quarter circle, terminating at straight angles.',
        back: 'A curve that backs up before going forward.',
        elastic: 'A curve that wobbles smoothly.',
        bounce: 'A curve that bounces hard.'
    }
})