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
 * Examples of partial config content:
 * - You can override or extract whole sections of the config:
 * ```
 * Config.twitch.rewardConfigs = {
 *    [Keys.KEY_YOURREWARD]: {
 *        title: 'YOUR TITLE',
 *        cost: 100
 *    }}
 * ```
 * - You can override drilled down values in anything already loaded:
 * ```
 * Config.controller.commandPermissionsOverrides[Keys.COMMAND_LOG_OFF].moderators = true;
 * ```
 *
 * You can also replace the separator symbols used in these files (-+=) in: `config.php`
 */
class Config {
    static credentials: ICredentialsConfig = undefined
    static controller: IControllerConfig = undefined
    static google: IGoogleConfig = undefined
    static obs: IObsConfig = undefined
    static pipe: IPipeConfig = undefined
    static screenshots: IScreenshotConfig = undefined
    static discord: IDiscordConfig = undefined
    static philipshue: IPhilipsHueConfig = undefined
    static openvr2ws: IOpenVR2WSConfig = undefined
    static audioplayer: IAudioPlayerConfig = undefined
    static sign: ISignConfig = undefined
    static run: IRunConfig = undefined
    static twitch: ITwitchConfig = undefined
    static web: IWebConfig = undefined
}