interface IRunConfig {
    [key: string]: IRunCommand
}

interface IRunCommand {
    window: string
    commands: IRunCommandConfig[]
    duration?: number // Seconds before reset
}

interface IRunCommandConfig {
    command: string
    value: any,
    defaultValue?: any // Resets to this if available
}