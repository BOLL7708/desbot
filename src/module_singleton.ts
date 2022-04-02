class ModuleSingleton {
    private static instance: ModuleSingleton;

    public twitch: Twitch = new Twitch()
    public twitchHelix: TwitchHelix = new TwitchHelix()
    public twitchTokens: TwitchTokens = new TwitchTokens()
    public tts: GoogleTTS = new GoogleTTS()
    public pipe: Pipe = new Pipe()
    public obs: OBS = new OBS()
    public sssvr: SuperScreenShotterVR = new SuperScreenShotterVR()
    public hue: PhilipsHue = new PhilipsHue()
    public openvr2ws: OpenVR2WS = new OpenVR2WS()
    public audioPlayer: AudioPlayer = new AudioPlayer()
    public sign: Sign = new Sign()

    private constructor() {}
    public static getInstance(): ModuleSingleton {
        if (!this.instance) this.instance = new ModuleSingleton();
        return this.instance;
    }
}