import ConfigPipe from '../Objects/Data/Config/ConfigPipe.js'
import ConfigChat from '../Objects/Data/Config/ConfigChat.js'
import WebSockets from './WebSockets.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import {ITwitchMessageData} from './Twitch.js'
import {IActionUser} from '../Objects/Data/Action/AbstractAction.js'
import {ITwitchHelixUsersResponseData} from '../Helpers/TwitchHelixHelper.js'
import Utils from '../Utils/Utils.js'
import TextHelper from '../Helpers/TextHelper.js'
import TwitchFactory from './TwitchFactory.js'
import ImageHelper from '../Helpers/ImageHelper.js'
import ImageEditor from './ImageEditor.js'
import Color from '../Constants/ColorConstants.js'
import ActionPipe from '../Objects/Data/Action/ActionPipe.js'
import DataUtils from '../Objects/Data/DataUtils.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import ConfigController from '../Objects/Data/Config/ConfigController.js'
import AbstractData from '../Objects/Data/AbstractData.js'
import {PresetPipeCustom} from '../Objects/Data/Preset/PresetPipe.js'
import ConfigImageEditorRect, {ConfigImageEditorOutline} from '../Objects/Data/Config/ConfigImageEditor.js'
import OptionPipeAnchorType from '../Objects/Options/OptionPipeAnchorType.js'
import ArrayUtils from '../Utils/ArrayUtils.js'

export default class Pipe {
    private _config: ConfigPipe = new ConfigPipe()
    private _chatConfig: ConfigChat = new ConfigChat()
    private _socket?: WebSockets = undefined
    constructor() {}
    async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigPipe())
        this._chatConfig = await DataBaseHelper.loadMain(new ConfigChat())
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init()
    }
    private onMessage(evt: MessageEvent) {
        const data = JSON.parse(evt.data)
        if(this._socket && data) this._socket.resolvePromise(data['nonce'], data)
        else console.warn('Unhandled Pipe response', data)
    }
    private onError(evt: Event) {
        // console.table(evt)
    }

    isConnected(): boolean {
        return this._socket?.isConnected() ?? false
    }

    setOverlayTitle(title: string) {
        this._socket?.send(JSON.stringify(<IPipeRequest>{
            basicTitle: title,
            basicMessage: "Initializing Overlay Pipe"
        }))
    }

    sendBasicObj(
        messageData: ITwitchMessageData,
        userData: IActionUser,
        helixUser?: ITwitchHelixUsersResponseData
    ) {
        this.sendBasic(
            messageData.text,
            userData.name,
            userData.color,
            helixUser?.profile_image_url ?? '',
            messageData
        ).then()
    }
    
    async sendBasic(
        message: string, 
        displayName: string = '',
        userColor?: string,
        profileUrl?: string, 
        messageData?: ITwitchMessageData
    ) {
        if(!this._socket?.isConnected()) console.warn('Pipe.sendBasic: Websockets instance not initiated.')

        // Skip if supposed to be skipped
        const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
        if(Utils.matchFirstChar(message, controllerConfig.secretChatSymbols)) return console.warn(`Pipe: Skipping secret chat: ${message}`)
        const hasBits = (messageData?.bits ?? 0) > 0
        const cleanTextConfig = Utils.clone(this._config.cleanTextConfig)
        cleanTextConfig.removeBitEmotes = hasBits
        const cleanText = await TextHelper.cleanText(
            message,
            cleanTextConfig,
            TwitchFactory.getEmotePositions(messageData?.emotes ?? []),
        )
        
        // TODO: Maybe we should also skip if there are only punctuation?
        if(cleanText.length == 0 && !this._config.useCustomChatNotification) return console.warn("Pipe: Clean text had zero length, skipping")
        
        // Build message
        let done = false
        const imageDataUrl = profileUrl != undefined
            ? await ImageHelper.getDataUrl(profileUrl, true)
            : null

        const preset = Utils.clone(DataUtils.ensureData(this._chatConfig.pipePreset))
        if(
            this._config.useCustomChatNotification
            && preset
        ) { // Custom notification

            // TODO: This mega major much needs to be separated out and made into a class for text rendering.
            //  Also need to have simplified settings/parameters because now it's a cluster-cluck.

            // Setup
            const imageEditor = new ImageEditor()
            
            // Prepare message
            const customMessageData: ITwitchMessageData = messageData ?? {text: message, bits: 0, isAction: false, emotes: []}
            const margin = this._config.customChatMessageConfig.margin
            const textRect = new ConfigImageEditorRect()
            textRect.x = margin
            textRect.y = this._config.customChatMessageConfig.top + margin
            textRect.w = this._config.customChatMessageConfig.width - margin * 2
            textRect.h = this._config.customChatMessageConfig.textMaxHeight
            const textResult = await imageEditor.buildTwitchText(customMessageData, textRect, this._config.customChatMessageConfig.font)
            const isOneRow = textResult.rowsDrawn == 1
            const size = textResult.pixelHeight + margin * 2 // TODO: Increase this to avoid emojis clipping at top/bottom

            // Draw background
            const maxCanvasWidth = this._config.customChatMessageConfig.width
            const actualCanvasWidth = isOneRow 
                ? textResult.firstRowWidth + margin * 2 + size 
                : maxCanvasWidth
            imageEditor.initiateEmptyCanvas(
                actualCanvasWidth,
                this._config.customChatMessageConfig.top
					+ textResult.pixelHeight
					+ margin * 2
            )
            const imageEditorRect = new ConfigImageEditorRect()
            imageEditorRect.x = isOneRow ? size : 0,
            imageEditorRect.y = isOneRow ? 0 : this._config.customChatMessageConfig.top,
            imageEditorRect.w = isOneRow ? textResult.firstRowWidth + margin * 2 : this._config.customChatMessageConfig.width,
            imageEditorRect.h = size
            const imageEditorOutline = new ConfigImageEditorOutline()
            imageEditorOutline.width = 16
            imageEditorOutline.color = '#666'
            imageEditor.drawBackground(
                imageEditorRect,
                this._config.customChatMessageConfig.cornerRadius,
                Color.Gray,
                imageEditorOutline
            )

            // Draw message
            if(isOneRow) {
                textRect.x = size + margin
                textRect.y = margin
            }
            imageEditor.drawBuiltTwitchText(textRect)

            // Avatar
            if(imageDataUrl != null) {
                // Replace undefined colors in outlines with user color or default
                const avatarConfig = Utils.clone(this._config.customChatAvatarConfig)
                for(const [key, value] of avatarConfig.outlines?.entries() ?? []) {
                    // TODO: Does changing this in value actually update the avatarConfig? Debug this later.
                    if(value.color.length == 0 ) value.color = userColor ?? Color.White
                }
                // Draw
                const avatarRectSingle = new ConfigImageEditorRect()
                avatarRectSingle.x = 0
                avatarRectSingle.y = 0
                avatarRectSingle.w = size
                avatarRectSingle.h = size
                const avatarRect = isOneRow ? avatarRectSingle : avatarConfig.rect

                // Draw image
                await imageEditor.drawImage(
                    imageDataUrl, 
                    avatarRect, 
                    avatarConfig.cornerRadius, 
                    avatarConfig.outlines
                )
            }

            // Name
            if(textResult.rowsDrawn > 1) {
                const nameFontConfig = Utils.clone(this._config.customChatNameConfig.font)
                if(nameFontConfig.color.length == 0) nameFontConfig.color = userColor ?? Color.White
                if(displayName.length > 0) {
                    await imageEditor.drawText(displayName, this._config.customChatNameConfig.rect, nameFontConfig)
                }
            }

            // Show it
            const action = new ActionPipe()
            action.customPreset = DataUtils.buildFakeDataEntries(preset)
            action.imageDataEntries = [imageEditor.getData()]
            action.durationMs = 2500 + textResult.writtenChars * 50
            if(isOneRow) {
                preset.width *= (1.0+(actualCanvasWidth / maxCanvasWidth))/2.0
            }
            this.showAction(action).then()
            done = true
        } 
        
        if(!done) { // SteamVR notification
            if(this._config.useCustomChatNotification) Utils.log("Pipe: No preset found for chat messages", Color.Red)

            const text = displayName.length > 0 ? `${displayName}: ${cleanText}` : cleanText
            if(imageDataUrl != null) {
                this._socket?.send(JSON.stringify(<IPipeRequest>{
                    basicTitle: "",
                    basicMessage: text,
                    imageData: Utils.removeImageHeader(imageDataUrl)
                }))
            } else {
                this._socket?.send(JSON.stringify(<IPipeRequest>{
                    basicTitle: "",
                    basicMessage: text,
                }))
            }
        }
    }

    async sendCustom(preset: PresetPipeCustom&AbstractData, imageData: string, durationMs: number = -1) {
        if(!this._socket?.isConnected()) console.warn('Pipe.sendCustom: Websockets instance not initiated.')
        const nonce = Utils.getNonce('custom-pipe')
        const animations: IPipeRequestCustomPropertiesAnimation[] = []
        for(const animPreset of preset.animations) {
            animations.push({
                property: animPreset.property,
                amplitude: animPreset.amplitude,
                frequency: animPreset.amplitude_andFrequency,
                phase: animPreset.waveform_withPhase,
                waveform: animPreset.waveform,
                flipWaveform: animPreset.waveform_andFlip
            })
        }
        const textAreas: IPipeRequestCustomPropertiesTextArea[] = []
        for(const areaPreset of preset.textAreas) {
            textAreas.push({
                text: areaPreset.text,
                xPositionPx: areaPreset.positionX,
                yPositionPx: areaPreset.positionX_Y,
                widthPx: areaPreset.width,
                heightPx: areaPreset.width_height,
                fontSizePt: areaPreset.fontFamily_size,
                fontFamily: areaPreset.fontFamily,
                fontColor: areaPreset.fontFamily_andColor,
                horizontalAlignment: areaPreset.alignmentHorizontally,
                verticalAlignment: areaPreset.alignmentHorizontally_andVertically
            })
        }
        const message: IPipeRequest = {
            nonce,
            imageData,
            customProperties: {
                enabled: true,
                anchorType: preset.anchorType,
                attachToAnchor: preset.anchorType_isAttached,
                ignoreAnchorYaw: preset.ignoreAnchorYaw,
                ignoreAnchorPitch: preset.ignoreAnchorYaw_andPitch,
                ignoreAnchorRoll: preset.ignoreAnchorYaw_andRoll,

                overlayChannel: preset.overlayChannel,
                animationHz: -1,
                durationMs: durationMs > 0 ? durationMs : preset.durationMs,
                opacityPer: preset.opacity,

                widthM: preset.width,
                zDistanceM: preset.positionX_andZ,
                yDistanceM: preset.positionX_andY,
                xDistanceM: preset.positionX,

                yawDeg: preset.angleYaw,
                pitchDeg: preset.angleYaw_andPitch,
                rollDeg: preset.angleYaw_andRoll,

                follow: {
                    enabled: preset.follow.enabled,
                    triggerAngle: preset.follow.triggerAngle,
                    durationMs: preset.follow.durationMs,
                    easeType: preset.follow.easeType,
                    easeMode: preset.follow.easeType_withMode
                },
                transitionIn: {
                    scalePer: preset.transitionIn.scale,
                    opacityPer: preset.transitionIn.opacity,
                    zDistanceM: preset.transitionIn.moveX_andZ,
                    yDistanceM: preset.transitionIn.moveX_andY,
                    xDistanceM: preset.transitionIn.moveX,
                    yawDeg: preset.transitionIn.rotateYaw,
                    pitchDeg: preset.transitionIn.rotateYaw_andPitch,
                    rollDeg: preset.transitionIn.rotateYaw_andRoll,
                    durationMs: preset.transitionIn.durationMs,
                    easeType: preset.transitionIn.easeType,
                    easeMode: preset.transitionIn.easeType_withMode
                },
                transitionOut: {
                    scalePer: preset.transitionOut.scale,
                    opacityPer: preset.transitionOut.opacity,
                    zDistanceM: preset.transitionOut.moveX_andZ,
                    yDistanceM: preset.transitionOut.moveX_andY,
                    xDistanceM: preset.transitionOut.moveX,
                    yawDeg: preset.transitionOut.rotateYaw,
                    pitchDeg: preset.transitionOut.rotateYaw_andPitch,
                    rollDeg: preset.transitionOut.rotateYaw_andRoll,
                    durationMs: preset.transitionOut.durationMs,
                    easeType: preset.transitionOut.easeType,
                    easeMode: preset.transitionOut.easeType_withMode
                },
                animations,
                textAreas
            }
        }
        const response = await this._socket?.sendMessageWithPromise(JSON.stringify(message), nonce, 10000)
        console.log('Pipe.sendCustom result', response)
    }
    async showAction(action: ActionPipe, index?: number) {
	    if(!this._socket?.isConnected()) console.warn('Pipe.showPreset: Websockets instance not initiated.')
        const basicPreset = DataUtils.ensureData(action.basicPreset)
        const customPreset = DataUtils.ensureData(action.customPreset)
        if(!basicPreset && !customPreset) return console.warn('Pipe.showPreset: Action did not contain any preset.')

        // Basic preset, expand on this later?
        if(basicPreset) {
            this.sendBasic(basicPreset.message, basicPreset.title).then()
        }

        // If path exists, load image, in all cases output base64 image data
        const states = StatesSingleton.getInstance()
        let imageB64arr: string[] = []
        if(action.imagePathEntries.length > 0) {
            for(const imagePath of action.imagePathEntries) {
                const stateKey = customPreset?.anchorType ?? OptionPipeAnchorType.Head
                states.pipeLastImageFileNamePerAnchor.set(stateKey, imagePath.split('/').pop() ?? '')
                imageB64arr.push(await ImageHelper.getDataUrl(imagePath))
            }
        } else if (action.imageDataEntries.length > 0) {
            imageB64arr = action.imageDataEntries
        } else {
            if(customPreset) console.warn("Pipe: No image path nor image data found for preset")
        }
        
        // If the above resulted in image data, broadcast it
        for(const imageB64 of imageB64arr) {
            if(customPreset) {
                const textAreaCount = customPreset.textAreas.length
                const texts = ArrayUtils.getAsType(action.texts, action.texts_use)
                let i = 0
                let text = texts[i]
                let textArea = customPreset.textAreas[i]
                while(text && textArea) {
                    textArea.text = text
                    i++
                    text = texts[i]
                    textArea = customPreset.textAreas[i]
                }
                this.sendCustom(
                    customPreset,
                    Utils.removeImageHeader(imageB64),
                    action.durationMs
                ).then()
            }
        }
        if(imageB64arr.length == 0) {
            console.warn('Pipe: Show Custom, could not find image!')
        }
    }
}

interface IPipeRequest {
    imageData?: string
    imagePath?: string
    nonce?: string
    basicTitle?: string
    basicMessage?: string
    customProperties?: IPipeRequestCustomProperties
}

interface IPipeRequestCustomProperties {
    enabled: boolean
    anchorType: string
    attachToAnchor: boolean
    ignoreAnchorYaw: boolean
    ignoreAnchorPitch: boolean
    ignoreAnchorRoll: boolean

    overlayChannel: number
    animationHz: number
    durationMs: number
    opacityPer: number

    widthM: number
    zDistanceM: number
    yDistanceM: number
    xDistanceM: number

    yawDeg: number
    pitchDeg: number
    rollDeg: number

    follow: IPipeRequestCustomPropertiesFollow
    transitionIn: IPipeRequestCustomPropertiesTransition
    transitionOut: IPipeRequestCustomPropertiesTransition
    animations: IPipeRequestCustomPropertiesAnimation[]
    textAreas: IPipeRequestCustomPropertiesTextArea[]
}

interface IPipeRequestCustomPropertiesFollow {
    enabled: boolean
    triggerAngle: number
    durationMs: number
    easeType: string
    easeMode: string
}

interface IPipeRequestCustomPropertiesTransition {
    scalePer: number
    opacityPer: number
    zDistanceM: number
    yDistanceM: number
    xDistanceM: number
    yawDeg: number
    pitchDeg: number
    rollDeg: number
    durationMs: number
    easeType: string
    easeMode: string
}

interface IPipeRequestCustomPropertiesAnimation {
    property: string
    amplitude: number
    frequency: number
    phase: string
    waveform: string
    flipWaveform: boolean
}

interface IPipeRequestCustomPropertiesTextArea {
    text: string
    xPositionPx: number
    yPositionPx: number
    widthPx: number
    heightPx: number
    fontSizePt: number
    fontFamily: string
    fontColor: string
    horizontalAlignment: string
    verticalAlignment: string
}