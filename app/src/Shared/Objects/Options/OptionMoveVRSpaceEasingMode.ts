import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionMoveVRSpaceEasingMode extends AbstractOption {
    static readonly in = 'In'
    static readonly out = 'Out'
    static readonly inOut = 'InOut'
}
OptionsMap.addPrototype({
    prototype: OptionMoveVRSpaceEasingMode
})