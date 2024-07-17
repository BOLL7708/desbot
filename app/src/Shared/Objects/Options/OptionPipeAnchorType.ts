import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeAnchorType extends AbstractOption {
    static readonly World = 'World'
    static readonly Headset = 'Headset'
    static readonly LeftHand = 'LeftHand'
    static readonly RightHand = 'RightHand'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnchorType,
    description: 'The anchor type for the overlay.',
    documentation: {
        World: 'Overlay is fixed in the world.',
        Headset: 'Overlay is fixed to the headset.',
        LeftHand: 'Overlay is fixed to the left hand.',
        RightHand: 'Overlay is fixed to the right hand.'
    }
})