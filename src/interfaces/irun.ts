/**
 * This enables sending key presses to a specific window on your desktop using [AutoIt v3](https://www.autoitscript.com).
 * 
 * User the AutoIt shell extension to compile the `run\run.au3` file into `run\run.exe` by right-clicking `run.au3` and pick `Compile Script`.
 * 
 * Note: For this to work you should run Apache from autorun and not as a service, because services aren't allowed to touch the desktop.
 */
interface IRunConfig {
    /**
     * Fill this with configs available for standard automatic rewards.
     */
    configs: { [key:string]: IRunCommand }
    
    /**
     * Fill this with game specific rewards for that gets reused per game.
     * 
     * The concept is that the widget detects the game, and uses `Config.twitch.gameSpecificRewardsPerGame` 
     * to dynamically update the settings of any used reward listed in `Config.twitch.gameSpecificRewards`
     * if they have a config, else they are disabled.
     */
    gameSpecificConfigs: { [key:string]: { [key:string]: IRunCommand }}
}
interface IRunCommand {
    /**
     * The title of the window to send the key press to.
     */
    window: string
    /**
     * A list of commands to execute.
     */
    commands: IRunCommandConfig[]
    /**
     * Optional: Seconds before running the command if the optional reset value is provided.
     */
    duration?: number
    /**
     * Optional: Press enter at the end of every command, defaults to `true`.
     * 
     * The thinking here is that most console commands need this, but it can be turned off if needed.
     */
    postfixEnterStroke?: boolean
}
interface IRunCommandConfig {
    /**
     * A full command 
     */
    command: string|string[]
    /**
     * Optional: Make sure to supply this if you are planning to reset to default.
     */
    value?: any,
    /**
     * Optional: Resets to this if it's available.
     */
    defaultValue?: any
}