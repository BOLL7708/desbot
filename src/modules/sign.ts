class Sign {
    private _config: ISignConfig = Config.instance.sign
    private _div: HTMLDivElement
    private _hiddenPos: string = `-${this._config.width}px`
    private _img: HTMLImageElement
    private _title: HTMLParagraphElement
    private _subtitle: HTMLParagraphElement
    private _queue: ISignShowConfig[] = []
    private _queueLoopHandle: number = 0

    constructor() {
        const div = document.createElement('div')
        // TODO: Move things like font, text color, animation direct, all to config.
        div.style.width = `${this._config.width}px`
        div.style.height = `${this._config.height}px`
        div.style.background = 'transparent'
        div.style.position = 'absolute'
        div.style.left = `-${this._config.width}px`
        div.style.opacity = '0'
        div.style.transition = `left ${this._config.transitionDuration}ms, opacity ${this._config.transitionDuration}ms`
        div.style.fontFamily = 'PT Sans Narrow'
        div.style.fontSize = '150%'
        div.style.fontWeight = 'bold'
        div.style.color = 'white'
        div.style.textAlign = 'center'
        div.style.whiteSpace = 'nowrap'
        div.style.overflow = 'hidden'
        div.style.textOverflow = 'ellipsis'
        
        const title = document.createElement('p')
        const imageContainer = document.createElement('p')
        const image = new Image()
        image.style.width = '90%'
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
        this._queue.push(config)
    }

    tryShowNext() {
        if(this.isSignVisible()) return
        const config = this._queue.shift()
        if(config == undefined) return // The queue is empty
        this.show(config)
    }

    private isSignVisible():boolean {
        return this._div.style.left != this._hiddenPos
    }

    private show(config: ISignShowConfig) {
        this._img.src = config.image
        this._img.onload = ()=>{
            this._title.innerText = config.title
            this._subtitle.innerText = config.subtitle
            this._div.style.left = '0'
            this._div.style.opacity = '1.0'
            setTimeout(()=>{
                this._div.style.left = this._hiddenPos
                this._div.style.opacity = '0.0'
            }, config.duration)
        }
    }
}