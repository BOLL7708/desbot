import {OptionMoveVRSpaceCorrection} from '../../Options/OptionMoveVRSpaceCorrection.mts'
import {OptionMoveVRSpaceEasingMode} from '../../Options/OptionMoveVRSpaceEasingMode.mts'
import {OptionMoveVRSpaceEasingType} from '../../Options/OptionMoveVRSpaceEasingType.mts'
import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {DataUtils} from '../DataUtils.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionMoveVRSpace extends AbstractAction {
    durationMs: number = 0
    easingInType: string = OptionMoveVRSpaceEasingType.linear
    easingInType_withMode: string = OptionMoveVRSpaceEasingMode.out
    easingInType_durationPercent: number = 0
    easingOutType: string = OptionMoveVRSpaceEasingType.linear
    easingOutType_withMode: string = OptionMoveVRSpaceEasingMode.out
    easingOutType_durationPercent: number = 0
    resetSpaceChangesBefore: boolean = false
    resetOffsetChangesAfter: boolean = false
    correction: string = OptionMoveVRSpaceCorrection.playSpace
    spaceMoveEntries: ActionMoveVRSpaceEntry[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionMoveVRSpace(),
            tag: '🌐',
            description: 'Used to move the SteamVR play space.',
            help: 'The easing types and modes you see below are all based on <a href="https://easings.net/" target="_blank">easings.net</a>, which lists all available types.',
            instructions: {
                easingInType: 'Use these easing values to affect the whole animation, running on top of the individual move entries, can be used to fade a repeating animation in and out.',
                spaceMoveEntries: 'Add entries here to apply offsets or rotations. These will be applied simultaneously but can be offset in time.'
            },
            documentation: {
                durationMs: 'The duration of the whole animation in milliseconds.',
                easingInType: 'The easing type, mode and duration to use for the start of the animation.',
                easingOutType: 'The easing type, mode and duration to use for the end of the animation.',
                resetSpaceChangesBefore: 'Will reset the play space to the setup that is stored on disk.',
                resetOffsetChangesAfter: 'Will reset the offset applied after the animation is done.',
                correction: 'The correction applied to the origin before applying any offsets.',
                spaceMoveEntries: 'The entries that will be applied simultaneously.'
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
}

export class ActionMoveVRSpaceEntry extends AbstractData {
    offsetX: number = 0
    offsetX_Y: number = 0
    offsetX_Z: number = 0
    rotate: number = 0
    easingType: string = OptionMoveVRSpaceEasingType.linear
    easingType_withMode: string = OptionMoveVRSpaceEasingMode.in
    startAtPercent: number = 0
    startAtPercent_andEndAtPercent: number = 1
    pingPong: boolean = false
    repeat: number = 0
    repeat_andAccumulate: boolean = false
    enlist() {
        DataMap.addSubInstance({
            instance: new ActionMoveVRSpaceEntry(),
            documentation: {
                offsetX: 'The amount to move the play space sideways (X), vertically (Y) and forward and backwards (Z).',
                rotate: 'Horizontal rotation of the play space in degrees, positive degrees rotates left from your point of view.',
                easingType: 'The easing type and mode to use for the animation, will be affected by offsets and other settings.',
                startAtPercent: 'Will start and stop animating on percentage values of the full duration.',
                pingPong: 'Will in the animation duration play the animation back and forth, ending where it started.',
                repeat: 'The amount of times to repeat the animation, when accumulating, the offset will add up over the repetitions.'
            },
            types: {
                offsetX: DataUtils.getNumberRangeRef(-2, 2, 0.01),
                offsetX_Y: DataUtils.getNumberRangeRef(-2, 2, 0.01),
                offsetX_Z: DataUtils.getNumberRangeRef(-2, 2, 0.01),
                easingType: OptionMoveVRSpaceEasingType.ref,
                easingType_withMode: OptionMoveVRSpaceEasingMode.ref,
                startAtPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                startAtPercent_andEndAtPercent: DataUtils.getNumberRangeRef(0, 1, 0.01),
                repeat: DataUtils.getNumberRangeRef(0, 100)
            }
        })
    }
}