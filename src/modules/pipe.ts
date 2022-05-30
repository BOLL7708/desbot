class Pipe {
    private _socket:WebSockets
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${Config.pipe.port}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
    }
    init() {
        this._socket.init()
    }
    private onMessage(evt: MessageEvent) {
        console.log(evt.data)
    }
    private onError(evt: Event) {
        // console.table(evt)
    }

    setOverlayTitle(title: string) {
        this._socket.send(JSON.stringify(<IPipeBasicMessage>{
            basicTitle: title,
            basicMessage: "Initializing Notification Pipe for Streaming Widget"
        }))
    }

    async sendBasicObj(
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
        )
    }
    
    async sendBasic(
        message: string, 
        displayName: string = '',
        userColor?: string,
        profileUrl?: string, 
        messageData?: ITwitchMessageData
    ) {
        // Skip if supposed to be skipped
        if(Utils.matchFirstChar(message, Config.controller.secretChatSymbols)) return console.warn(`Pipe: Skipping secret chat: ${message}`)
        const hasBits = (messageData?.bits ?? 0) > 0
        const cleanTextConfig = Utils.clone(Config.pipe.cleanTextConfig)
        cleanTextConfig.removeBitEmotes = hasBits
        const cleanText = await Utils.cleanText(
            message,
            cleanTextConfig,
            TwitchFactory.getEmotePositions(messageData?.emotes ?? []),
        )
        
        // TODO: Maybe we should also skip if there are only punctuation?
        if(cleanText.length == 0 && !Config.pipe.useCustomChatNotification) return console.warn("Pipe: Clean text had zero length, skipping")
        
        // Build message
        let done = false
        const imageDataUrl = profileUrl != undefined
            ? await ImageLoader.getDataUrl(profileUrl, true)
            : null
        const preset = Utils.clone(Config.twitchChat.pipe)
        if(!preset) return Utils.log("Pipe: No preset found for chat messages", Color.Red)
        if(
            Config.pipe.useCustomChatNotification
        ) { // Custom notification
            
            // Setup
            const imageEditor = new ImageEditor()
            
            // Prepare message
            const customMessageData: ITwitchMessageData = messageData ?? {text: message, bits: 0, isAction: false, emotes: []}
            const margin = Config.pipe.customChatMessageConfig.margin
            const textRect = {
                x: margin,
                y: Config.pipe.customChatMessageConfig.top + margin,
                w: Config.pipe.customChatMessageConfig.width - margin * 2,
                h: Config.pipe.customChatMessageConfig.textMaxHeight
            }
            const textResult = await imageEditor.buildTwitchText(customMessageData, textRect, Config.pipe.customChatMessageConfig.font)
            const isOneRow = textResult.rowsDrawn == 1
            const size = textResult.pixelHeight + margin * 2

            // Draw background
            const maxCanvasWidth = Config.pipe.customChatMessageConfig.width
            const actualCanvasWidth = isOneRow 
                ? textResult.firstRowWidth + margin * 2 + size 
                : maxCanvasWidth
            imageEditor.initiateEmptyCanvas(
                actualCanvasWidth,
                Config.pipe.customChatMessageConfig.top 
					+ textResult.pixelHeight
					+ margin * 2
            )
            imageEditor.drawBackground({
                    x: isOneRow ? size : 0,
                    y: isOneRow ? 0 : Config.pipe.customChatMessageConfig.top,
                    w: isOneRow ? textResult.firstRowWidth + margin * 2 : Config.pipe.customChatMessageConfig.width,
                    h: size
                }, 
                Config.pipe.customChatMessageConfig.cornerRadius, 
                Color.Gray,
                {
                    width: 16,
                    color: '#666'
                }
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
                const avatarConfig = Utils.clone(Config.pipe.customChatAvatarConfig)
                for(const outlineIndex in avatarConfig.outlines) {
                    const index = parseInt(outlineIndex)
                    if(avatarConfig.outlines[index].color == undefined) {
                        avatarConfig.outlines[index].color = userColor ?? Color.White
                    }
                }
                // Draw
                const avatarRect = isOneRow ? {
                    x: 0,
                    y: 0,
                    w: size,
                    h: size
                } : avatarConfig.rect

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
                const nameFontConfig = Utils.clone(Config.pipe.customChatNameConfig.font)
                if(nameFontConfig.color == undefined) nameFontConfig.color = userColor ?? Color.White
                if(displayName.length > 0) {
                    await imageEditor.drawText(displayName, Config.pipe.customChatNameConfig.rect, nameFontConfig)
                }
            }

            // Show it
            const messageDataUrl = imageEditor.getData()
            preset.imageData = messageDataUrl
            preset.imagePath = undefined
            preset.durationMs = 2500 + textResult.writtenChars * 50
            if(isOneRow) {
                let width = preset.config?.customProperties?.widthM ?? 0
                // TODO: Move the 1.0 into Config as scale shorter messages up, 0 is valid default.
                if(preset.config.customProperties) preset.config.customProperties.widthM = width * (1.0+(actualCanvasWidth / maxCanvasWidth))/2.0
            }
            this.showPreset(preset)
            done = true
        } 
        
        if(!done) { // SteamVR notification
            const text = displayName.length > 0 ? `${displayName}: ${cleanText}` : cleanText
            if(imageDataUrl != null) {
                this._socket.send(JSON.stringify(<IPipeBasicMessage>{
                    basicTitle: "",
                    basicMessage: text,
                    imageData: Utils.removeImageHeader(imageDataUrl)
                }))
            } else {
                this._socket.send(JSON.stringify(<IPipeBasicMessage>{
                    basicTitle: "",
                    basicMessage: text,
                }))
            }
        }
    }

    sendCustom(message: IPipeCustomMessage) {
        this._socket.send(JSON.stringify(message))
    }

    async showPreset(preset: IPipeMessagePreset) {
        // If path exists, load image, in all cases output base64 image data
        let imageb64: string|undefined
        if(preset.imagePath != undefined) {
            const imagePath = Array.isArray(preset.imagePath) ? Utils.randomFromArray(preset.imagePath) : preset.imagePath
            imageb64 = await ImageLoader.getDataUrl(imagePath)
        } else if (preset.imageData != undefined) {
            imageb64 = preset.imageData
        } else {
            console.warn("Pipe: No image path nor image data found for preset")
        }
        
        // If the above resulted in image data, broadcast it
        const config = Utils.clone(preset.config)
        if(imageb64) {
            config.imageData = Utils.removeImageHeader(imageb64)
            if(config.customProperties) {           
               config.customProperties.animationHz = -1
               config.customProperties.durationMs = preset.durationMs;
               if(
                   config.customProperties.textAreas != undefined
                   && preset.texts != undefined 
                   && preset.texts.length >= config.customProperties.textAreas.length
               ) {
                   for(let i=0; i<preset.texts.length; i++) {
                       config.customProperties.textAreas[i].text = preset.texts[i]
                   }
               }
            }
            this.sendCustom(config)
        } else {
            console.warn('Pipe: Show Custom, could not find image!')
        }
    }
}