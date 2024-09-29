import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

export default class OptionPipeAnimationWaveform extends AbstractOption {
    static readonly PhaseBased = 'PhaseBased'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnimationWaveform,
    description: 'The waveform for the animation curve.',
    documentation: {}
})