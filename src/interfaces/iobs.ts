/**
 * Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin.
 */
interface IObsConfig {
    /**
     * The port set for the OBS WebSockets plugin.
     */
    port:number
    /**
     * Source configs for automatic rewards to reference. 
     * 
     * Add a config using a key like `Keys.YOURREWARD` and this will automatically run on redemption.
     */
    configs: { [key:string]: IObsSourceConfig }
    /**
     * WIP: This appears buggy but would filter certain features to work in certain scenes. 
     * It changed even when messing around in the studio mode though, so for now it's disabled.
     */
    filterOnScenes: string[]
    /**
     * Configuration for taking OBS Source screenshots. 
     * 
     * This is going to be moved into automatic rewards so it can be used for multiple things.
     */
    sourceScreenshotConfig: IObsSourceScreenshotConfig
}
interface IObsSourceConfig {
    /**
     * The name of the source to affect.
     */
    sourceName: string
    /**
     * Optional: If we are showing/hiding the source, we need to know which scene(s) it is in.
     */
    sceneNames?: string[]
    /**
     * Optional: Instead of toggling the source, we will toggle a filter on the source, which also means we don't have to provide the scene name(s).
     */
    filterName?: string
    /**
     * Optional: The source/filter will be hidden/inactivated again after this amount of milliseconds, or provided.
     */
    durationMs?: number
}
interface IObsSourceScreenshotConfig {
    /**
     * The name of the source to take a screenshot of.
     */
    sourceName: string
    /**
     * Image format of the screenshot file.
     */
    embedPictureFormat: string
    /**
     * Folder to save the screenshot in.
     */
    saveToFilePath: string
    /**
     * Description for the screenshot when posted to Discord.
     */
	discordDescription: string
    /**
     * Backup game title in the footer when posting to Discord, only used if there is no game registered as running.
     */
    discordGameTitle: string
    /**
     * Title for the screenshot when shown as a Sign.
     */
    signTitle: string
    /**
     * Display duration in milliseconds for the screenshot Sign.
     */
    signDurationMs: number
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}
interface ISourceScreenshotCallback {
    (img:string, data: IScreenshotRequestData): void
}