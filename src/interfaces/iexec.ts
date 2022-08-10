/**
 * This enables sending key presses to a specific window on your desktop using [AutoIt v3](https://www.autoitscript.com).
 * 
 * User the AutoIt shell extension to compile the `run\run.au3` file into `run\run.exe` by right-clicking `run.au3` and pick `Compile Script`.
 * 
 * Note: For this to work you should run Apache from autorun and not as a service, because services aren't allowed to touch the desktop.
 */
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