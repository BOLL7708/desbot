import AbstractAction, {IActionCallback} from './AbstractAction.js'
import DataMap from '../DataMap.js'
import AbstractData from '../AbstractData.js'
import {OptionMoveVRSpaceEasingType} from '../../Options/OptionMoveVRSpaceEasingType.js'
import {OptionMoveVRSpaceEasingMode} from '../../Options/OptionMoveVRSpaceEasingMode.js'
import DataUtils from '../DataUtils.js'

export default class ActionMoveVRSpace extends AbstractAction {
    ResetBeforeRun: boolean = false
    ResetAfterRun: boolean = false
    Entries: ActionMoveVRSpaceEntry[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionMoveVRSpace(),
            tag: '🌐',
            description: 'Used to move the SteamVR play space.',
            documentation: {
                ResetBeforeRun: 'Will reset existing changes before running any entries.',
                ResetAfterRun: 'Will reset existing changes after running any entries.',
                Entries: 'The entries that will be run.'
            },
            types: {
                Entries: ActionMoveVRSpaceEntry.ref.build()
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionMoveVRSpaceRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionMoveVRSpace>(key, this)
    }
}

export class ActionMoveVRSpaceEntry extends AbstractData {
    OffsetX: number = 0
    OffsetY: number = 0
    OffsetZ: number = 0
    EasingType: OptionMoveVRSpaceEasingType = OptionMoveVRSpaceEasingType.linear
    EasingMode: OptionMoveVRSpaceEasingMode = OptionMoveVRSpaceEasingMode.in
    DurationMs: number = 0
    DelayMs: number = 0
    PingPong: boolean = false
    Repeat: number = 0
    enlist() {
        DataMap.addSubInstance({
            instance: new ActionMoveVRSpaceEntry(),
            documentation: {
                OffsetX: 'The amount to move the play space sideways.',
                OffsetY: 'The amount to move the play space vertically.',
                OffsetZ: 'The amount to move the play space front to back.',

                // TODO: Add the rest of the documentation
            },
            types: {
                OffsetX: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                OffsetY: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                OffsetZ: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                EasingType: OptionMoveVRSpaceEasingType.ref,
                EasingMode: OptionMoveVRSpaceEasingMode.ref,
                DurationMs: DataUtils.getNumberRangeRef(0, 10000),
                DelayMs: DataUtils.getNumberRangeRef(0, 10000),
                Repeat: DataUtils.getNumberRangeRef(0, 100)
            },
            instructions: {
                EasingType: 'The easing type and mode to use for the animation, you can see what they act like at <a href="https://easings.net/" target="_blank">easings.net</a>.',
            }
        })
    }
}