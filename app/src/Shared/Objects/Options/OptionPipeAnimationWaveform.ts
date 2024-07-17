import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeAnimationWaveform extends AbstractOption {
    static readonly PhaseBased = 'PhaseBased'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnimationWaveform,
    description: 'The waveform for the animation curve.',
    documentation: {}
})