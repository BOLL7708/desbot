interface IWebConfig {
    configs: { [key:string]: IWebRequestConfig}
}

interface IWebRequestConfig {
    url: string
}