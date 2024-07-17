import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeAnimationPhase extends AbstractOption {
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