interface IRunConfig {
    configs: { [key:string]: IRunCommand }
    gameSpecificConfigs: { [key:string]: { [key:string]: IRunCommand }}
}
interface IRunCommand {
    window: string
    commands: IRunCommandConfig[]
    duration?: number // Seconds before reset
}
interface IRunCommandConfig {
    command: string|string[]
    value?: any, // Use this if you are planning to reset to default
    defaultValue?: any // Resets to this if available
}