import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionPipeAnimationProperty extends AbstractOption {
    static readonly None = 'None'
    static readonly Yaw = 'Yaw'
    static readonly Pitch = 'Pitch'
    static readonly Roll = 'Roll'
    static readonly PositionZ = 'PositionZ'
    static readonly PositionY = 'PositionY'
    static readonly PositionX = 'PositionX'
    static readonly Scale = 'Scale'
    static readonly Opacity = 'Opacity'
}
OptionsMap.addPrototype({
    prototype: OptionPipeAnimationProperty,
    description: 'The property to animate.',
    documentation: {}
})