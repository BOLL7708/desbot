import TwitchTokens from './modules/twitch_tokens.js'
import OBS from './modules/obs.js'
import TwitchHelix from './modules/twitch_helix.js'
import Twitch from './modules/twitch.js'
import OpenVR2WS from './modules/openvr2ws.js'
import AudioPlayer from './modules/audioplayer.js'
import SuperScreenShotterVR from './modules/sssvr.js'
import Sign from './modules/sign.js'
import Pipe from './modules/pipe.js'
import TwitchPubsub from './modules/twitch_pubsub.js'
import PhilipsHue from './modules/philipshue.js'
import GoogleTTS from './modules/google_tts.js'

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