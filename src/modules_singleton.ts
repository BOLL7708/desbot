/**
 * Contains instances of various modules
 */
class ModulesSingleton {
    private static _instance: ModulesSingleton;
    private constructor() {}
    public static getInstance(): ModulesSingleton {
        if (!this._instance) this._instance = new ModulesSingleton();
        return this._instance;
    }

    public twitch = new Twitch()
    public twitchHelix = new TwitchHelix()
    public twitchTokens = new TwitchTokens()
    public twitchPubsub = new TwitchPubsub()
    public tts = new GoogleTTS()
    public pipe = new Pipe()
    public obs = new OBS()
    public sssvr = new SuperScreenShotterVR()
    public hue = new PhilipsHue()
    public openvr2ws = new OpenVR2WS()
    public audioPlayer = new AudioPlayer()
    public sign = new Sign()
}