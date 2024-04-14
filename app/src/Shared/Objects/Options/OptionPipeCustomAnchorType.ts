import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export default class OptionPipeCustomAnchorType extends AbstractOption {
    static readonly World = 0
    static readonly Headset = 1
    static readonly LeftHand = 2
    static readonly RightHand = 3
}
OptionsMap.addPrototype({
    prototype: OptionPipeCustomAnchorType,
    description: 'The anchor type for the overlay.',
    documentation: {
        World: 'Overlay is fixed in the world.',
        Headset: 'Overlay is fixed to the headset.',
        LeftHand: 'Overlay is fixed to the left hand.',
        RightHand: 'Overlay is fixed to the right hand.'
    }
})