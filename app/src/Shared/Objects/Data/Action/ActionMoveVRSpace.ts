import AbstractAction, {IActionCallback} from './AbstractAction.js'
import DataMap from '../DataMap.js'
import AbstractData from '../AbstractData.js'
import OptionMoveVRSpaceEasingType from '../../Options/OptionMoveVRSpaceEasingType.js'
import OptionMoveVRSpaceEasingMode from '../../Options/OptionMoveVRSpaceEasingMode.js'
import DataUtils from '../DataUtils.js'
import OptionMoveVRSpaceCorrection from '../../Options/OptionMoveVRSpaceCorrection.js'

export default class ActionMoveVRSpace extends AbstractAction {
    durationMs: number = 0
    easingInType: string = OptionMoveVRSpaceEasingType.linear
    easingInType_withMode: string = OptionMoveVRSpaceEasingMode.out
    easingInType_durationPercent: number = 0
    easingOutType: string = OptionMoveVRSpaceEasingType.linear
    easingOutType_withMode: string = OptionMoveVRSpaceEasingMode.out
    easingOutType_durationPercent: number = 0
    resetChangesBefore: boolean = false
    resetChangesBefore_andAfter: boolean = false
    correction: string = OptionMoveVRSpaceCorrection.playSpace
    spaceMoveEntries: ActionMoveVRSpaceEntry[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionMoveVRSpace(),
            tag: '🌐',
            description: 'Used to move the SteamVR play space.',
            instructions: {
                durationMs: 'The easing type and mode to use for the animation, you can see what they act like at <a href="https://easings.net/" target="_blank">easings.net</a>.',
            },
            documentation: {
                resetChangesBefore: 'If before, will reset to what is on disk, if after, will reset the changes done in this action. This might change.',
                correction: 'The correction to apply to the offset used to move the play space.',
                spaceMoveEntries: 'The entries that will be applied simultaneously.'
                // TODO: Complete documentation
            },
            types: {
                durationMs: DataUtils.getNumberRangeRef(0, 10000),
                easingInType: OptionMoveVRSpaceEasingType.ref,
                easingInType_withMode: OptionMoveVRSpaceEasingMode.ref,
                easingInType_durationPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                easingOutType: OptionMoveVRSpaceEasingType.ref,
                easingOutType_withMode: OptionMoveVRSpaceEasingMode.ref,
                easingOutType_durationPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                correction: OptionMoveVRSpaceCorrection.ref,
                spaceMoveEntries: ActionMoveVRSpaceEntry.ref.build()
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
    offsetX: number = 0
    offsetX_Y: number = 0
    offsetX_Z: number = 0
    rotate: number = 0
    easingType: string = OptionMoveVRSpaceEasingType.linear
    easingType_withMode: string = OptionMoveVRSpaceEasingMode.in
    startAtPercent: number = 0
    startAtPercent_andEndAtPercent: number = 0
    pingPong: boolean = false
    pingPong_andRepeat: number = 0
    enlist() {
        DataMap.addSubInstance({
            instance: new ActionMoveVRSpaceEntry(),
            documentation: {
                offsetX: 'The amount to move the play space sideways (X), vertically (Y) and forward and backwards (Z).',
                rotate: 'Horizontal rotation of the play space in degrees.'
                // TODO: Complete documentation
            },
            types: {
                offsetX: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                offsetX_Y: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                offsetX_Z: DataUtils.getNumberRangeRef(-2, 2, 0.1),
                easingType: OptionMoveVRSpaceEasingType.ref,
                easingType_withMode: OptionMoveVRSpaceEasingMode.ref,
                startAtPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                startAtPercent_andEndAtPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                pingPong_andRepeat: DataUtils.getNumberRangeRef(0, 100)
            }
        })
    }
}