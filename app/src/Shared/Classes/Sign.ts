import ActionSign from '../Objects/Data/Action/ActionSign.js'
import ConfigSign from '../Objects/Data/Config/ConfigSign.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import Utils from '../Utils/Utils.js'
import Color from '../Constants/ColorConstants.js'

export default class Sign {
    private _div: HTMLDivElement
    private _img: HTMLImageElement
    private _title: HTMLParagraphElement
    private _subtitle: HTMLParagraphElement
    private _queue: ActionSign[] = []
    private _queueLoopHandle: number|any = 0 // TODO: Transitional node fix
    private _isVisible: boolean = false
    private _config: ConfigSign = new ConfigSign()

    constructor() {
        this._div = document.createElement('div')
        this._title = document.createElement('p')
        this._subtitle = document.createElement('p')
        this._img = new Image()
        document.body.appendChild(this._div)
        this.init().then()
        this.startQueueLoop()
    }

    private async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigSign())
        this._div.className = 'sign'
        this._div.style.width = `${this._config.sizeWidth}px`
        this._div.style.height = `${this._config.sizeHeight}px`
        this._div.style.background = 'transparent'
        this._div.style.position = 'absolute'
        this.setVisible(false) // Hidden
        this._div.style.transition = `${this._config.direction} ${this._config.transitionDurationMs}ms, opacity ${this._config.transitionDurationMs}ms`
        this._div.style.fontFamily = this._config.fontFamily
        this._div.style.color = this._config.fontColor
        this._div.style.fontSize = this._config.fontSize
        this._div.style.textAlign = 'center'
        this._div.style.padding = '0 5px'
        this._div.style.boxSizing = 'border-box'
        this._title.style.fontWeight = 'bold'
        this._img.style.width = '100%'
        this._img.style.borderRadius = '5px'
        this._img.style.boxShadow = '0 3px 3px 3px #0003'
        this._div.appendChild(this._title)
        this._div.appendChild(this._img)
        this._div.appendChild(this._subtitle)
    }

    private setVisible(visible: boolean) {
        this._config.direction = this._config.direction.toLowerCase()
        const offsetX = visible ? '0' : `-${this._config.sizeWidth}px`
        const offsetY = visible ? '0' : `-${this._config.sizeHeight}px`
        switch(this._config.direction) {
            case 'right': this._div.style.right = offsetX; break
            case 'left': this._div.style.left = offsetX; break
            case 'bottom': this._div.style.bottom = offsetY; break
            case 'top': this._div.style.top = offsetY; break
        }
        this._div.style.opacity = visible ? '1.0' : '0.0'
    }

    private startQueueLoop() {
        this._queueLoopHandle = setInterval(this.tryShowNext.bind(this), 500)
    }

    enqueueSign(action: ActionSign) {
        if(action.title.length == 0 && action.imageSrc.length == 0 && action.subtitle.length == 0) {
            Utils.log(
                `Could not enqueue sign, config incomplete: ${JSON.stringify(action)}`,
                Color.Red
            )
        } else this._queue.push(action)
    }

    tryShowNext() {
        if(this._isVisible) return
        const config = this._queue.shift()
        if(config == undefined) return // The queue is empty
        this.show(config)
    }

    private show(config: ActionSign) {
        this._isVisible = true
        this._img.onload = ()=>{ // Wait for image to load
            this._title.innerText = config.title
            this._subtitle.innerText = config.subtitle
            this.setVisible(true)
            setTimeout(()=>{ // Wait before hiding
                this.setVisible(false)
                setTimeout(()=>{ // Wait for the animation back to finish
                    this._isVisible = false
                }, this._config.transitionDurationMs)
            }, config.durationMs+this._config.transitionDurationMs)
        }
        this._img.onerror = ()=>{
            this._isVisible = false
        }
        this._img.src = config.imageSrc
    }
}