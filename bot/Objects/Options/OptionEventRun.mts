import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

export class OptionEventRun extends AbstractOption {
    static readonly immediately = 0
    static readonly msAfterPrevious = 1
    static readonly msAfterStart = 2
}
OptionsMap.addPrototype({
    prototype: OptionEventRun,
    description: 'Will affect how the actions of this event are timed.',
    documentation: {
        immediately: 'Will run the actions immediately when the event is triggered.',
        msAfterPrevious: 'Will run the actions a set delay after the previous actions.',
        msAfterStart: 'Will run the actions a set time after the event was triggered.'
    }
})