// Config
interface ISignConfig {
    enabled: boolean
    width: number
    height: number
    transitionDuration: number
    fontFamily: string
    fontColor: string
    fontSize: string
    direction: string // left, right, top, bottom
}

// Settings
interface ISignShowConfig {
    title: string
    image: string
    subtitle: string
    duration: number
}