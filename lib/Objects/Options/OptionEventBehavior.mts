import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionEventBehavior extends AbstractOption {
    static readonly All = 0
    static readonly Random = 100
    static readonly Incrementing = 200
    static readonly Accumulating = 300
    static readonly MultiTier = 400
}
OptionsMap.addPrototype({
    prototype: OptionEventBehavior,
    description: 'Will affect how this event uses each entry of actions set on it.',
    documentation: {
        All: 'Will run all the actions.',
        Random: 'Will run one random action.',
        Incrementing: 'Will run the actions in sequential order. (think multiple reward redemptions)',
        Accumulating: 'Will accumulate a value until it reaches a goal. (useful for community challenge rewards)',
        MultiTier: 'Will switch to the next state if done before the reset timer expires. (useful for leveling up rewards)'
    }
})