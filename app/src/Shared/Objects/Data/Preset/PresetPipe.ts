import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'
import DataUtils from '../DataUtils.js'
import OptionPipeCustomAnchorType from '../../Options/OptionPipeCustomAnchorType.js'

export default class PresetPipeBasic extends AbstractData {
    imageData: string = ''
    basicTitle: string = 'OpenVRNotificationPipe'
    basicMessage: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPipeBasic(),
            label: 'basicTitle'
        })
    }
}
export class PresetPipeCustom extends AbstractData {
    imageData: string = ''
    imagePath: string = ''
    customProperties = new PresetPipeCustomProperties()

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPipeCustom(),
            description: 'This is what is sent to the Pipe application',
            documentation: {
                imageData: 'Optional: In this solution we set the image from the preset so this is not needed in the payload.',
                imagePath: 'Optional: Absolute path to an image, not used in this solution except for when doing tests.',
                customProperties: 'Properties for the custom overlay.'
            },
            types: {
                imagePath: DataUtils.getStringFileImageRef()
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
 * Properties for the general state of the overlay
 */
export class PresetPipeCustomProperties extends AbstractData {
    enabled: boolean = true
    nonce: string = ''
    anchorType: number = 1
    attachToAnchor: boolean = false
    ignoreAnchorYaw: boolean = false
    ignoreAnchorPitch: boolean = false
    ignoreAnchorRoll: boolean = false
    overlayChannel: number = 0
    animationHz: number = -1
    durationMs: number = 5000
    opacityPer: number = 1
    widthM: number = 1
    zDistanceM: number = 1
    yDistanceM: number = 0
    xDistanceM: number = 0
    yawDeg: number = 0
    pitchDeg: number = 0
    rollDeg: number = 0
    follow = new PresetPipeCustomFollow()
    animations: PresetPipeCustomAnimation[] = []
    transitions: PresetPipeCustomTransition[] = []
    textAreas: PresetPipeCustomTextArea[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomProperties(),
            documentation: {
                enabled: 'Set to true to show a custom overlay instead of a basic one.',
                nonce: 'Value that will be returned in callback if provided.',
                anchorType: 'What to anchor the overlay to, any position set will be in relation to this anchor.',
                attachToAnchor: 'Fix the overlay to the anchor',
                ignoreAnchorYaw: 'Ignore anchor device yaw angle for the overlay',
                ignoreAnchorPitch: 'Ignore anchor device pitch angle for the overlay',
                ignoreAnchorRoll: 'Ignore anchor device roll angle for the overlay',
                overlayChannel: 'The channel for this overlay.\nEach channel has a separate queue and can be shown simultaneously.',
                animationHz: 'Animation Hz, is set to -1 to run at headset Hz',
                durationMs: 'Duration in milliseconds, is set by preset so should be left out.',
                opacityPer: 'Opacity of the overlay, 1 = 100%',
                widthM: 'Physical width of the overlay in meters',
                zDistanceM: 'Physical distance to the overlay in meters',
                yDistanceM: 'Offsets vertically in meters',
                xDistanceM: 'Offsets horizontally in meters',
                yawDeg: 'Angle left or right in degrees',
                pitchDeg: 'Angle up or down in degrees',
                rollDeg: 'Spin angle in degrees',
                follow: 'Follow settings',
                animations: 'Animation settings',
                transitions: 'Entry 0 is the in-transition, entry 1 is the out transition.', // TODO: Should probably move this to separate properties, a breaking change in the pipe though.
                textAreas: 'Define any number of text areas to be displayed on the image.'
            },
            types: {
                animations: PresetPipeCustomAnimation.ref.build(),
                textAreas: PresetPipeCustomTextArea.ref.build(),
                transitions: PresetPipeCustomTransition.ref.build(), // This is needed or else types won't be converted after an import as they are unknown.

                anchorType: OptionPipeCustomAnchorType.ref,
                opacityPer: DataUtils.getNumberRangeRef(0, 1, 0.01)
            }
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
    tweenType: number = 5

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomFollow(),
            documentation: {
                triggerAngle: 'Triggering cone angle',
            }
        })
    }
}

export class PresetPipeCustomAnimation extends AbstractData {
    property: number = 0
    amplitude: number = 1
    frequency: number = 1
    phase: number = 0
    waveform: number = 0
    flipWaveform: boolean = false

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomAnimation(),
            documentation: {
                property: '0: None (disabled)\n1: Yaw\n2: Pitch\n3: Roll\n4: Z\n5: Y\n6: X\n7: Scale\n8: Opacity',
                phase: '0: Sine\n1: Cosine\n2: Negative Sine\n3: Negative Cosine',
                waveform: '0: PhaseBased'
            }
        })
    }
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
export class PresetPipeCustomTransition extends AbstractData {
    scalePer: number = 1
    opacityPer: number = 0
    zDistanceM: number = 0
    yDistanceM: number = 0
    xDistanceM: number = 0
    yawDeg: number = 0
    pitchDeg: number = 0
    rollDeg: number = 0
    durationMs: number = 250
    tweenType: number = 5

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomTransition(),
            documentation: {
                zDistanceM: 'Translational offset',
                yDistanceM: 'Translational offset',
                xDistanceM: 'Translational offset',
            }
        })
    }
}

/**
 * Layout properties for text areas
 */
export class PresetPipeCustomTextArea extends AbstractData {
    text: string = ''
    xPositionPx: number = 0
    yPositionPx: number = 0
    widthPx: number = 100
    heightPx: number = 100
    fontSizePt: number = 10
    fontFamily: string = ''
    fontColor: string = ''
    horizontalAlignment: number = 0
    verticalAlignment: number = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new PresetPipeCustomTextArea(),
            documentation: {
                horizontalAlignment: '0: Left\n1: Center\n2: Right',
                verticalAlignment: '0: Left\n1: Center\n2: Right'
            }
        })
    }
}