import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetPipeBasic extends BaseDataObject {
    imageData: string = ''
    basicTitle: string = ''
    basicMessage: string = ''
}
export class PresetPipeCustom extends BaseDataObject {
    imageData: string = ''
    imagePath: string = ''
    customProperties = new PresetPipeCustomProperties()
}

/**
 * Properties for the general state of the notification
 */
export class PresetPipeCustomProperties extends BaseDataObject {
    enabled: boolean = true
    nonce: string = ''
    anchorType: number = 1
    attachToAnchor: boolean = true
    ignoreAnchorYaw: boolean = false
    ignoreAnchorPitch: boolean = false
    ignoreAnchorRoll: boolean = false
    overlayChannel: number = 0
    animationHz: number = -1
    durationMs: number = 0
    opacityPer: number = 1
    widthM: number = 1
    zDistanceM: number = 0
    yDistanceM: number = 0
    xDistanceM: number = 0
    yawDeg: number = 0
    pitchDeg: number = 0
    rollDeg: number = 0
    follow = new PresetPipeCustomFollow()
    animations: PresetPipeCustomAnimation[] = []
    transitions: PresetPipeCustomTransition[] = []
    textAreas: PresetPipeCustomTextArea[] = []
}

/**
 * Follow
 */
export class PresetPipeCustomFollow extends BaseDataObject {
    enabled: boolean = true
    triggerAngle: number = 0
    durationMs: number = 1000
    tweenType: number = 1
}

export class PresetPipeCustomAnimation extends BaseDataObject {
    property: number = 1
    amplitude: number = 0
    frequency: number = -1
    phase: number = 0
    waveform: number = 1
    flipWaveform: boolean = false
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
export class PresetPipeCustomTransition extends BaseDataObject {
    scalePer: number = 0
    opacityPer: number = 0
    zDistanceM: number = 0
    yDistanceM: number = 0
    xDistanceM: number = 0
    yawDeg: number = 0
    pitchDeg: number = 0
    rollDeg: number = 0
    durationMs: number = 0
    tweenType: number = 0
}

/**
 * Layout properties for text areas
 */
export class PresetPipeCustomTextArea extends BaseDataObject {
    text: string = ''
    xPositionPx: number = 0
    yPositionPx: number = 0
    widthPx: number = 0
    heightPx: number = 0
    fontSizePt: number = 0
    fontFamily: string = ''
    fontColor: string = ''
    horizontalAlignment: number = 0
    verticalAlignment: number = 0
}

DataObjectMap.addMainInstance(new PresetPipeBasic())
DataObjectMap.addMainInstance(
    new PresetPipeCustom(),
    'This is what is sent to the Pipe application',
    {
        imageData: 'Optional: In this solution we set the image from the preset so this is not needed in the payload.',
        imagePath: 'Optional: Absolute path to an image, not used in this solution except for when doing tests.',
        customProperties: 'Properties for the custom notification.'
    },
    {}
)

DataObjectMap.addSubInstance(
    new PresetPipeCustomProperties(),
    {
        enabled: 'Set to true to show a custom notification instead of a basic one.',
        nonce: 'Value that will be returned in callback if provided.',
        anchorType: 'What to anchor the notification to:\n0: World\n1: Headset\n2: Left Hand\n3: Right Hand',
        attachToAnchor: 'Fix the notification to the anchor',
        ignoreAnchorYaw: 'Ignore anchor device yaw angle for the notification',
        ignoreAnchorPitch: 'Ignore anchor device pitch angle for the notification',
        ignoreAnchorRoll: 'Ignore anchor device roll angle for the notification',
        overlayChannel: 'The channel for this notification.\nEach channel has a separate queue and can be shown simultaneously.',
        animationHz: 'Animation Hz, is set to -1 to run at headset Hz',
        durationMs: 'Duration in milliseconds, is set by preset so should be left out.',
        opacityPer: 'Opacity of the notification, 1 = 100%',
        widthM: 'Physical width of the notification in meters',
        zDistanceM: 'Physical distance to the notification in meters',
        yDistanceM: 'Offsets vertically in meters',
        xDistanceM: 'Offsets horizontally in meters',
        yawDeg: 'Angle left or right in degrees',
        pitchDeg: 'Angle up or down in degrees',
        rollDeg: 'Spin angle in degrees',
        follow: 'Follow settings',
        animations: 'Animation settings',
        transitions: 'Include one transition object for same in/out, two for different in/out.',
        textAreas: 'Define any number of text areas to be displayed on the image.'
    },
    {
        animations: PresetPipeCustomAnimation.ref(),
        transitions: PresetPipeCustomTransition.ref(),
        textAreas: PresetPipeCustomTextArea.ref()
    }
)
DataObjectMap.addSubInstance(new PresetPipeCustomFollow())
DataObjectMap.addSubInstance(new PresetPipeCustomAnimation())
DataObjectMap.addSubInstance(new PresetPipeCustomTransition())
DataObjectMap.addSubInstance(new PresetPipeCustomTextArea())