import Twitch from '../Classes/Api/Twitch.mts'
import TwitchEventSub from '../Classes/Api/TwitchEventSub.mts'
import GoogleTTS from '../Classes/Api/GoogleTTS.mts'
import Pipe from '../Classes/Api/Pipe.mts'
import OBS from '../Classes/Api/OBS.mts'
import SuperScreenShotterVR from '../Classes/Api/SuperScreenShotterVR.mts'
import OpenVR2WS from '../Classes/Api/OpenVR2WS.mts'
import AudioPlayer from '../Classes/Web/AudioPlayer.mts'
import Sign from '../Classes/Web/Sign.mts'
import Relay from '../Classes/Api/Relay.mts'
import StreamDeckRelay from '../Classes/Data/StreamDeckRelay.mts'

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