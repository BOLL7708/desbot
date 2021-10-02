
class FavoriteViewerController {
    private _intervalHandle: number
    private _textSizeIntervalHandle: number
    private _currentUser: string
    private _textSize: number = 100
    private _container: any
    private _displayName: any
    private _profileImage: any
    private _audio: HTMLAudioElement
    
    constructor() {
        this._container = document.querySelector('#container')
        this._displayName = document.querySelector('#displayName')
        this._profileImage = document.querySelector('#profileImage')
        this._audio = new Audio('./assets/audience_cheers_13.wav')
        this._intervalHandle = setInterval(this.checkForUpdates.bind(this), 5000)
    }

    private async checkForUpdates() {
        const userData:IFavoriteViewer = await Settings.pullSetting(Settings.LABELS, 'key', Keys.KEY_FAVORITEVIEWER, true)
        if(userData && userData.userName && userData.userName != this._currentUser) {
            console.log(`New favorite viewer: ${userData.userName} != ${this._currentUser}`)
            this._currentUser = userData.userName
            this._displayName.style['font-size'] = '100pt'
            this._displayName.innerText = userData.displayName
            this._profileImage.style['background-image'] = `url(${userData.profileUrl})`
            this._textSizeIntervalHandle = setInterval(this.resizeText.bind(this), 1000/30)
            this._audio.play()
        }
    }

    private resizeText() {
        console.log("Setting size?")
        if(this._displayName.clientWidth < window.innerWidth && this._container.clientHeight < window.innerHeight) {
            this._textSize += 10
        } else {
            console.log(`Finished scaling text! ${this._textSize}`)
            this._textSize -= 10
            clearInterval(this._textSizeIntervalHandle)
        }
        this._displayName.style['font-size'] = `${this._textSize}pt`
    }
}

interface IFavoriteViewer {
    key: string
    userName: string
    displayName: string
    profileUrl: string
}