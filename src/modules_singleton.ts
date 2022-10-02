import TwitchTokens from './Classes/twitch_tokens.js'
import OBS from './Classes/obs.js'
import TwitchHelix from './ClassesStatic/TwitchHelix.js'
import Twitch from './Classes/twitch.js'
import OpenVR2WS from './Classes/openvr2ws.js'
import AudioPlayer from './Classes/audioplayer.js'
import SuperScreenShotterVR from './Classes/sssvr.js'
import Sign from './Classes/sign.js'
import Pipe from './Classes/pipe.js'
import TwitchPubsub from './Classes/twitch_pubsub.js'
import PhilipsHue from './Classes/philipshue.js'
import GoogleTTS from './Classes/google_tts.js'

/**
 * Contains instances of various modules
 */
export default class ModulesSingleton {
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