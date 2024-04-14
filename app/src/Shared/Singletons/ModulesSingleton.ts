import Twitch from '../Classes/Twitch.js'
import TwitchEventSub from '../Classes/TwitchEventSub.js'
import GoogleTTS from '../Classes/GoogleTTS.js'
import Pipe from '../Classes/Pipe.js'
import OBS from '../Classes/OBS.js'
import SuperScreenShotterVR from '../Classes/SuperScreenShotterVR.js'
import OpenVR2WS from '../Classes/OpenVR2WS.js'
import AudioPlayer from '../Classes/AudioPlayer.js'
import Sign from '../Classes/Sign.js'
import Relay from '../Classes/Relay.js'
import StreamDeckRelay from '../Classes/StreamDeckRelay.js'

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
    public twitchEventSub = new TwitchEventSub()
    public tts = new GoogleTTS()
    public pipe = new Pipe()
    public obs = new OBS()
    public sssvr = new SuperScreenShotterVR()
    public openvr2ws = new OpenVR2WS()
    public audioPlayer = new AudioPlayer()
    public sign = new Sign()
    public relay = new Relay()
    public streamDeckRelay = new StreamDeckRelay()
}