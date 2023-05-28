import {ITwitchConfig} from '../Interfaces/itwitch.js'
import {IEventsConfig} from '../Interfaces/ievents.js'
import {ICredentialsConfig} from '../Interfaces/icredentials.js'
import {IControllerConfig} from '../Interfaces/icontroller.js'
import {IScreenshotConfig} from '../Interfaces/iscreenshots.js'

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
    static screenshots: IScreenshotConfig
    static twitch: ITwitchConfig
}