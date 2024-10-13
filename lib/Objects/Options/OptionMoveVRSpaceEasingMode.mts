import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionMoveVRSpaceEasingMode extends AbstractOption {
    static readonly in = 'In'
    static readonly out = 'Out'
    static readonly inOut = 'InOut'
}
OptionsMap.addPrototype({
    prototype: OptionMoveVRSpaceEasingMode,
    description: 'The easing mode for the animation.',
    documentation: {
        in: 'The easing will start slow and speed up.',
        out: 'The easing will start fast and slow down.',
        inOut: 'The easing will start slow, speed up and slow down.'
    }
})