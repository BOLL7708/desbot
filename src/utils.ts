class Utils {
    static splitOnFirst(needle:string, str:string):string[] {
        let [first, ...rest] = str.split(needle)
        return [first, rest.join(needle)]
    }
}