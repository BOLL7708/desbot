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

    public twitch: Twitch = new Twitch()
    public twitchHelix: TwitchHelix = new TwitchHelix()
    public twitchTokens: TwitchTokens = new TwitchTokens()
    public twitchPubsub: TwitchPubsub = new TwitchPubsub()
    public tts: GoogleTTS = new GoogleTTS()
    public pipe: Pipe = new Pipe()
    public obs: OBS = new OBS()
    public sssvr: SuperScreenShotterVR = new SuperScreenShotterVR()
    public hue: PhilipsHue = new PhilipsHue()
    public openvr2ws: OpenVR2WS = new OpenVR2WS()
    public audioPlayer: AudioPlayer = new AudioPlayer()
    public sign: Sign = new Sign()
}