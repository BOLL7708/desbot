class Sign {
    private _config: ISignConfig = Config.sign
    private _div: HTMLDivElement
    private _hiddenPos: string
    private _img: HTMLImageElement
    private _title: HTMLParagraphElement
    private _subtitle: HTMLParagraphElement
    private _queue: ISignShowConfig[] = []
    private _queueLoopHandle: number = 0
    private _isVisible 

    constructor() {
        this._config.direction = this._config.direction.toLowerCase()
        switch(this._config.direction) {
            case 'right':
            case 'left': this._hiddenPos = `-${this._config.width}px`
            case 'bottom':
            case 'top': this._hiddenPos = `-${this._config.height}px`
        }
        const div = document.createElement('div')
        div.style.width = `${this._config.width}px`
        div.style.height = `${this._config.height}px`
        div.style.background = 'transparent'
        div.style.position = 'absolute'
        div.style[this._config.direction] = this._hiddenPos // Hidden
        div.style.opacity = '0' // Hidden
        div.style.transition = `${this._config.direction} ${this._config.transitionDuration}ms, opacity ${this._config.transitionDuration}ms`
        div.style.fontFamily = this._config.fontFamily
        div.style.color = this._config.fontColor
        div.style.fontSize = this._config.fontSize
        div.style.textAlign = 'center'
        div.style.padding = '0 5%'
        div.style.boxSizing = 'border-box'
        
        const title = document.createElement('p')
        title.style.fontWeight = 'bold'
        const imageContainer = document.createElement('p')
        const image = new Image()
        image.style.width = '100%'
        image.style.borderRadius = '5%'
        image.style.boxShadow = '0 3px 3px 3px #0003'
        const subtitle = document.createElement('p')
        
        imageContainer.appendChild(image)
        div.appendChild(title)
        div.appendChild(imageContainer)
        div.appendChild(subtitle)

        document.body.appendChild(div)

        this._div = div
        this._img = image
        this._title = title
        this._subtitle = subtitle

        this.startQueueLoop()
    }

    private startQueueLoop() {
        this._queueLoopHandle = setInterval(this.tryShowNext.bind(this), 500)
    }

    enqueueSign(config: ISignShowConfig) {
        if(
            config.title == undefined 
            || config.subtitle == undefined 
            || config.image == undefined
        ) Utils.log(`Could not enqueue sign, config incomplete: ${JSON.stringify(config)}`, 'red')
        else this._queue.push(config)
    }

    tryShowNext() {
        if(this._isVisible) return
        const config = this._queue.shift()
        if(config == undefined) return // The queue is empty
        this.show(config)
    }

    private show(config: ISignShowConfig) {
        this._isVisible = true
        this._img.onload = ()=>{ // Wait for image to load
            this._title.innerText = config.title
            this._subtitle.innerText = config.subtitle
            this._div.style[this._config.direction] = '0'
            this._div.style.opacity = '1.0'
            setTimeout(()=>{ // Wait before hiding
                this._div.style[this._config.direction] = this._hiddenPos
                this._div.style.opacity = '0.0'
                setTimeout(()=>{ // Wait for the animation back to finish
                    this._isVisible = false
                }, this._config.transitionDuration)
            }, config.durationMs+this._config.transitionDuration)
        }
        this._img.onerror = ()=>{
            this._isVisible = false
        }
        this._img.src = config.image       
    }
}