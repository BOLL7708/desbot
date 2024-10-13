import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionPipeAnimationPhase extends AbstractOption {
    static readonly Linear = 'Linear'
    static readonly Sine = 'Sine'
    static readonly Cosine = 'Cosine'
    static readonly NegativeSine = 'NegativeSine'
    static readonly NegativeCosine = 'NegativeCosine'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnimationPhase,
    description: 'The phase of the animation curve.',
    documentation: {}
})