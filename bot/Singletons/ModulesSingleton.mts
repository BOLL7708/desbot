import Twitch from '../Classes/Twitch.mts'
import TwitchEventSub from '../Classes/TwitchEventSub.mts'
import GoogleTTS from '../Classes/GoogleTTS.mts'
import Pipe from '../Classes/Pipe.mts'
import OBS from '../Classes/OBS.mts'
import SuperScreenShotterVR from '../Classes/SuperScreenShotterVR.mts'
import OpenVR2WS from '../Classes/OpenVR2WS.mts'
import AudioPlayer from '../Classes/AudioPlayer.mts'
import Sign from '../Classes/Sign.mts'
import Relay from '../Classes/Relay.mts'
import StreamDeckRelay from '../Classes/StreamDeckRelay.mts'

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