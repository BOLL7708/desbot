import {IGoogleConfig} from '../Interfaces/igoogle.js'
import {IPipeConfig} from '../Interfaces/ipipe.js'
import {IPhilipsHueConfig} from '../Interfaces/iphilipshue.js'
import {IOpenVR2WSConfig} from '../Interfaces/iopenvr2ws.js'
import {ITwitchConfig} from '../Interfaces/itwitch.js'
import {IEventsConfig} from '../Interfaces/ievents.js'
import {ICredentialsConfig} from '../Interfaces/icredentials.js'
import {IControllerConfig} from '../Interfaces/icontroller.js'
import {IObsConfig} from '../Interfaces/iobs.js'
import {ISignConfig} from '../Interfaces/isign.js'
import {IDiscordConfig} from '../Interfaces/idiscord.js'
import {ITwitchChatConfig} from '../Interfaces/itwitch_chat.js'
import {ISteamConfig} from '../Interfaces/isteam.js'
import {IScreenshotConfig} from '../Interfaces/iscreenshots.js'
import {IAudioPlayerConfig} from '../Interfaces/iaudioplayer.js'

/**
 * This is the static container that holds all configuration values.
 * The config file(s) you are editing override things in this container.
 * This overriding can be done in multiple stages/files, descibed below.
 *
 * Break a big config apart in multiple files for better organization:
 * - Load file before the main config file: `_configs/config-YOURCONFIG.ts`
 * - Load file after the main config file: `_configs/config+YOURCONFIG.ts`
 *
 * It is also possible to create optional sub-configs that override things in anything prior:
 * - Load file at the very end: `_configs/config=YOURSUBCONFIG.ts`
 * - You can have multiple of these, and you decide which file to load by appending the widget URL with `?config=YOURSUBCONFIG`
 *
 * You can also replace the separator symbols used in these files (-+=) in: `config.php`
 */
export default class Config {
    static credentials: ICredentialsConfig
    static controller: IControllerConfig
    static events: IEventsConfig
    static eventsForGames: {[game: string]: IEventsConfig}
    static google: IGoogleConfig
    static steam: ISteamConfig
    static obs: IObsConfig
    static pipe: IPipeConfig
    static screenshots: IScreenshotConfig
    static discord: IDiscordConfig
    static philipshue: IPhilipsHueConfig
    static openvr2ws: IOpenVR2WSConfig
    static audioplayer: IAudioPlayerConfig
    static sign: ISignConfig
    static twitchChat: ITwitchChatConfig
    static twitch: ITwitchConfig
}