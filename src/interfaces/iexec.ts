/**
 * Execute kepresses and/or a custom URI.
 */
interface IExecConfig {
    /**
     * Send key presses to a window.
     */
    run?: IRunCommand
    
    /**
     * Trigger a custom URI. An array will trigger all of them.
     */
    uri?: string|string[]
}

/**
 * This enables sending key presses to a specific window on your desktop using [AutoIt v3](https://www.autoitscript.com).
 * 
 * User the AutoIt shell extension to compile the `run\run.au3` file into `run\run.exe` by right-clicking `run.au3` and pick `Compile Script`.
 * 
 * Note: For this to work you should run Apache from autorun and not as a service, because services aren't allowed to touch the desktop.
 */
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