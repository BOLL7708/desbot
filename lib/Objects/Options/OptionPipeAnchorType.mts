import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionPipeAnchorType extends AbstractOption {
    static readonly World = 'World'
    static readonly Head = 'Head'
    static readonly LeftHand = 'LeftHand'
    static readonly RightHand = 'RightHand'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnchorType,
    description: 'The anchor type for the overlay.',
    documentation: {
        World: 'Overlay is fixed in the world.',
        Head: 'Overlay is fixed to the headset.',
        LeftHand: 'Overlay is fixed to the left hand.',
        RightHand: 'Overlay is fixed to the right hand.'
    }
})