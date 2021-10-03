interface IRunConfig {
    configs: IRunCommands
    gameSpecificConfigs: IRunGameSpecificCommands
}

interface IRunGameSpecificCommands {
    [key: string]: IRunCommands
}
interface IRunCommands {
    [key: string]: IRunCommand
}
interface IRunCommand {
    window: string
    commands: IRunCommandConfig[]
    duration?: number // Seconds before reset
}
interface IRunCommandConfig {
    command: string
    value?: any, // Use this if you are planning to reset to default
    defaultValue?: any // Resets to this if available
}