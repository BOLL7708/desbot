import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetPipeBasic extends BaseDataObject {
    imageData: string = ''
    basicTitle: string = 'OpenVRNotificationPipe'
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
    transitions: PresetPipeCustomTransition[] = [
        new PresetPipeCustomTransition(),
        new PresetPipeCustomTransition()
    ]
    textAreas: PresetPipeCustomTextArea[] = []
}

/**
 * Follow
 */
export class PresetPipeCustomFollow extends BaseDataObject {
    enabled: boolean = false
    triggerAngle: number = 65
    durationMs: number = 250
    tweenType: number = 5
}

export class PresetPipeCustomAnimation extends BaseDataObject {
    property: number = 0
    amplitude: number = 1
    frequency: number = 1
    phase: number = 0
    waveform: number = 0
    flipWaveform: boolean = false
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
export class PresetPipeCustomTransition extends BaseDataObject {
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
}

/**
 * Layout properties for text areas
 */
export class PresetPipeCustomTextArea extends BaseDataObject {
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
}

DataObjectMap.addRootInstance(new PresetPipeBasic())
DataObjectMap.addRootInstance(
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
        transitions: 'Entry 0 is the in-transition, entry 1 is the out transition.', // TODO: Should probably move this to separate properties, a breaking change in the pipe though.
        textAreas: 'Define any number of text areas to be displayed on the image.'
    },
    {
        animations: PresetPipeCustomAnimation.ref(),
        textAreas: PresetPipeCustomTextArea.ref()
    }
)
DataObjectMap.addSubInstance(
    new PresetPipeCustomFollow(),
    {
        triggerAngle: 'Triggering cone angle',
    }
)
DataObjectMap.addSubInstance(
    new PresetPipeCustomAnimation(),
    {
        property: '0: None (disabled)\n1: Yaw\n2: Pitch\n3: Roll\n4: Z\n5: Y\n6: X\n7: Scale\n8: Opacity',
        phase: '0: Sine\n1: Cosine\n2: Negative Sine\n3: Negative Cosine',
        waveform: '0: PhaseBased'
    }
)
DataObjectMap.addSubInstance(
    new PresetPipeCustomTransition(),
    {
        zDistanceM: 'Translational offset',
        yDistanceM: 'Translational offset',
        xDistanceM: 'Translational offset',
    }
)
DataObjectMap.addSubInstance(
    new PresetPipeCustomTextArea(),
    {
        horizontalAlignment: '0: Left\n1: Center\n2: Right',
        verticalAlignment: '0: Left\n1: Center\n2: Right'
    }
)