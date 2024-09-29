import AbstractData, {DataEntries} from '../AbstractData.mts'
import DataMap from '../DataMap.mts'
import DataUtils from '../DataUtils.mts'
import OptionPipeAnchorType from '../../Options/OptionPipeAnchorType.mts'
import OptionPipeEasingMode from '../../Options/OptionPipeEasingMode.mts'
import OptionPipeEasingType from '../../Options/OptionPipeEasingType.mts'
import OptionPipeAnimationProperty from '../../Options/OptionPipeAnimationProperty.mts'
import OptionPipeAnimationPhase from '../../Options/OptionPipeAnimationPhase.mts'
import OptionPipeAnimationWaveform from '../../Options/OptionPipeAnimationWaveform.mts'
import OptionPipeTextAreaHorizontalAlignment from '../../Options/OptionPipeTextAreaHorizontalAlignment.mts'
import OptionPipeTextAreaVerticalAlignment from '../../Options/OptionPipeTextAreaVerticalAlignment.mts'
import PresetPipeChannel from './PresetPipeChannel.mts'

export default class PresetPipeBasic extends AbstractData {
    nonce: string = ''
    title: string = 'OpenVRNotificationPipe'
    message: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPipeBasic(),
            documentation: {
                nonce: 'Value that will be returned in callback if provided.',
                title: 'Descriptor of the channel, is only set on channel creation.'
            },
            label: 'title'
        })
    }
}
export class PresetPipeCustom extends AbstractData {
    nonce: string = ''
    durationMs: number = 3000
    anchorType: string = OptionPipeAnchorType.Head
    anchorType_isAttached: boolean = false
    ignoreAnchorYaw: boolean = false
    ignoreAnchorYaw_andPitch: boolean = false
    ignoreAnchorYaw_andRoll: boolean = false
    overlayChannel: number|DataEntries<PresetPipeChannel> = 0
    opacity: number = 1
    width: number = 1
    positionX: number = 0
    positionX_andY: number = 0
    positionX_andZ: number = 1
    angleYaw: number = 0
    angleYaw_andPitch: number = 0
    angleYaw_andRoll: number = 0
    follow = new PresetPipeCustomFollow()
    transitionIn = new PresetPipeCustomTransition()
    transitionOut = new PresetPipeCustomTransition()
    animations: PresetPipeCustomAnimation[] = []
    textAreas: PresetPipeCustomTextArea[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPipeCustom(),
            description: 'This is what is sent to the Pipe application',
            documentation: {
                nonce: 'Value that will be returned in callback if provided.',
                durationMs: 'Duration of the overlay display, will be overridden when used in an action.',
                anchorType: 'What anchor to place the overlay in relation to, and if the overlay should be attached so that it follows the anchor.',
                ignoreAnchorYaw: 'Ignore anchor device yaw, pitch and/or roll angle for the overlay',
                overlayChannel: 'The channel for this overlay, 0 if empty.\nEach channel has a separate queue and separate channels can be shown simultaneously.',
                opacity: 'Opacity of the overlay',
                width: 'Physical width of the overlay in meters',
                positionX: 'Offsets the overlay horizontally (X), vertically (Y) and in depth (Z) in meters',
                angleYaw: 'Angle the overlay left or right (yaw), up or down (pitch) or spin it (roll) in degrees',
                follow: 'Follow settings',
                transitionIn: 'How the overlay will transition in.',
                transitionOut: 'How the overlay will transition out.',
                animations: 'Animation settings',
                textAreas: 'Define any number of text areas to be displayed on the image.'
            },
            types: {
                anchorType: OptionPipeAnchorType.ref,
                overlayChannel: PresetPipeChannel.ref.id.build(),
                opacity: DataUtils.getNumberRangeRef(0, 1, 0.01),
                width: DataUtils.getNumberRangeRef(0, 10, 0.01),
                positionX: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                positionX_andY: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                positionX_andZ: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                angleYaw: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                angleYaw_andPitch: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                angleYaw_andRoll: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                animations: PresetPipeCustomAnimation.ref.build(),
                textAreas: PresetPipeCustomTextArea.ref.build()
            },
            tasks: [
                /*
                {
                    label: 'Test with OpenVROverlayPipe',
                    documentation: 'Will send the preset to the pipe using the image set in imagePath.',
                    filledInstance: true,
                    callback: async <PresetPipeCustom>(instance: PresetPipeCustom&Data)=> {
                        // TODO: This doesn't work, wait with using it until we have this in Node and the modules are always connected.
                        const modules = ModulesSingleton.getInstance()
                        if(!modules.pipe.isConnected()) await modules.pipe.init()
                        // @ts-ignore For some reason TSC doesn't think instance contains the properties even if the type is defined?!?!
                        const data = await ImageHelper.getDataUrl(instance.imagePath)
                        // @ts-ignore
                        instance.imageData = data
                        // @ts-ignore
                        await modules.pipe.sendCustom(instance)
                        return new RootToolResult()
                    }
                }
                */
            ]
        })
    }
}

/**
 * Follow
 */
export class PresetPipeCustomFollow extends AbstractData {
    enabled: boolean = false
    triggerAngle: number = 65
    durationMs: number = 250
    easeType: string = OptionPipeEasingType.Sine
    easeType_withMode: string = OptionPipeEasingMode.InOut

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomFollow(),
            documentation: {
                triggerAngle: 'Triggering cone angle, look away this far and the overlay will move.',
                durationMs: 'The time it takes for the follow animation to play, in milliseconds.'
            },
            types: {
                enabled: 'boolean|toggle',
                triggerAngle: DataUtils.getNumberRangeRef(1, 180, 1),
                durationMs: DataUtils.getNumberRangeRef(0, 1000, 1),
                easeType: OptionPipeEasingType.ref,
                easeType_withMode: OptionPipeEasingMode.ref
            }
        })
    }
}

export class PresetPipeCustomAnimation extends AbstractData {
    property: string = OptionPipeAnimationProperty.None
    amplitude: number = 1
    amplitude_andFrequency: number = 1
    waveform: string = OptionPipeAnimationWaveform.PhaseBased
    waveform_withPhase: string = OptionPipeAnimationPhase.Sine
    waveform_andFlip: boolean = false

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomAnimation(),
            documentation: {
                amplitude: 'The size of the animation in meters.',
                property: 'The property to animate.',
                waveform: 'Which waveform and phase the animation curve has.'
            },
            types: {
                property: OptionPipeAnimationProperty.ref,
                amplitude: DataUtils.getNumberRangeRef(-2, 2, 0.01),
                amplitude_andFrequency: DataUtils.getNumberRangeRef(1, 240, 1),
                waveform: OptionPipeAnimationWaveform.ref,
                waveform_withPhase: OptionPipeAnimationPhase.ref,
            }
        })
    }
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
export class PresetPipeCustomTransition extends AbstractData {
    enabled: boolean = false
    scale: number = 1
    opacity: number = 0
    moveX: number = 0
    moveX_andY: number = 0
    moveX_andZ: number = 0
    rotateYaw: number = 0
    rotateYaw_andPitch: number = 0
    rotateYaw_andRoll: number = 0
    durationMs: number = 250
    easeType: string = OptionPipeEasingType.Sine
    easeType_withMode: string = OptionPipeEasingMode.InOut

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomTransition(),
            documentation: {
                scale: 'Scale in percent.',
                opacity:'Opacity in percent.',
                moveX: 'Translational offset.',
                rotateYaw: 'Rotational effect.'
            },
            types: {
                enabled: 'boolean|toggle',
                scale: DataUtils.getNumberRangeRef(0, 10, 0.01),
                opacity: DataUtils.getNumberRangeRef(0, 10, 0.01),
                moveX: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                moveX_andY: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                moveX_andZ: DataUtils.getNumberRangeRef(-10, 10, 0.01),
                rotateYaw: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                rotateYaw_andPitch: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                rotateYaw_andRoll: DataUtils.getNumberRangeRef(-3600, 3600, 1),
                durationMs: DataUtils.getNumberRangeRef(0, 10000, 1),
                easeType: OptionPipeEasingType.ref,
                easeType_withMode: OptionPipeEasingMode.ref
            }
        })
    }
}

/**
 * Layout properties for text areas
 */
export class PresetPipeCustomTextArea extends AbstractData {
    text: string = ''
    positionX: number = 0
    positionX_Y: number = 0
    width: number = 100
    width_height: number = 100
    fontFamily: string = ''
    fontFamily_size: number = 10
    fontFamily_andColor: string = ''
    alignmentHorizontally: string = OptionPipeTextAreaHorizontalAlignment.Center
    alignmentHorizontally_andVertically: string = OptionPipeTextAreaVerticalAlignment.Center

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomTextArea(),
            documentation: {
                positionX: 'Position of the text area on the overlay, in pixels.',
                width: 'Size of the texta area, in pixels.',
                fontFamily: 'Font family, size (pts) and color.',
                alignmentHorizontally: 'Alignment of the text inside the bounding box.'
            },
            types: {
                positionX: DataUtils.getNumberRangeRef(0, 1920, 1),
                positionX_Y: DataUtils.getNumberRangeRef(0, 1080, 1),
                width: DataUtils.getNumberRangeRef(1, 1920, 1),
                width_height: DataUtils.getNumberRangeRef(1, 1080, 1),
                fontFamily_size: DataUtils.getNumberRangeRef(1, 240, 1),
                alignmentHorizontally: OptionPipeTextAreaHorizontalAlignment.ref,
                alignmentHorizontally_andVertically: OptionPipeTextAreaVerticalAlignment.ref
            }
        })
    }
}