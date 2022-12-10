import TwitchTokens from '../Classes/TwitchTokens.js'
import OBS from '../Classes/OBS.js'
import TwitchHelixHelper from '../Classes/TwitchHelixHelper.js'
import Twitch from '../Classes/Twitch.js'
import OpenVR2WS from '../Classes/OpenVR2WS.js'
import AudioPlayer from '../Classes/AudioPlayer.js'
import SuperScreenShotterVR from '../Classes/SuperScreenShotterVR.js'
import Sign from '../Classes/Sign.js'
import Pipe from '../Classes/Pipe.js'
import TwitchPubsub from '../Classes/TwitchPubsub.js'
import PhilipsHue from '../Classes/PhilipsHue.js'
import GoogleTTS from '../Classes/GoogleTTS.js'
import StreamDeckRelay from '../Classes/StreamDeckRelay.js'
import Relay from '../Classes/Relay.js'

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
    public relay = new Relay()
    public streamDeckRelay = new StreamDeckRelay()
}