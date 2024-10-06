/**
 * Gets filled with all the file-paths from the `_user/assets` folder, to be referenced in the editor and for serving.
 */
export default class AssetsHelper {
    static rootFolder = '_user'
    static rootPath = `../${this.rootFolder}`
    private static _filePaths: string[] = []
    private static _filePathCache: IAssetFilesCache = {}
    private static _ignoreList = ['main.sqlite']

    /**
     * Load a selection of the available asset file-paths.
     * @param start The start of the filepath string, usually `_user/assets/SOMETHING/`.
     * @param end The ends of the filepath string, usually a selection of extensions.
     * @returns A string array with matching file-paths.
     */
    static async get(start: string, end: string[]): Promise<string[]> {
        await this.getAll() // Make sure list is loaded.

        const leading = start.toLowerCase()
        const trailing = end.map((e) => e.toLowerCase())
        const key = `${leading}|${trailing.join('&')}`
        let files: string[]
        if(this._filePathCache.hasOwnProperty(key)) {
            // Return cache
            files = this._filePathCache[key]
        } else {
            // Create cache
            files = this._filePaths.filter((filePath) => {
                const filePathLowerCase = filePath.toLowerCase()
                if(!filePathLowerCase.startsWith(leading)) return false
                for(const extension of end) {
                    if(filePathLowerCase.endsWith(extension.toLowerCase())) {
                        return true
                    }
                }
                return false
            })
            this._filePathCache[key] = files
        }
        return files
    }

    static async getAll(force: boolean = false): Promise<string[]> {
        const pattern = new RegExp(`^.*${this.rootFolder}\/`)
        if(this._filePaths.length == 0 || force) {
            const loadDir = async (dirPath: string): Promise<string[]> => {
                const result: string[] = []
                for await(const dirEntry of Deno.readDir(dirPath)) {
                    const path = `${dirPath}/${dirEntry.name}`
                    if(dirEntry.isDirectory) {
                        result.push(...await loadDir(path))
                    } else if (dirEntry.isFile) {
                        if(this._ignoreList.includes(dirEntry.name)) continue
                        result.push(path.replace(pattern, ''))
                    }
                }
                return result
            }
            this._filePaths = await loadDir(this.rootPath)
        }
        return this._filePaths
    }

    /**
     * Will replace trailing slash to wildcard, will replace wildcard with all matching folders, will add relative root path to work in browser.
     * @param paths
     */
    static async preparePathsForUse(paths: string[]): Promise<string[]> {
        let i = 0
        for(let path of paths) {
            //  Load files and replace the entry with the found files.
            if(path.endsWith('/')) path += '*'
            if(path.includes('*') ) {
                const parts = path.split('*')
                const start = parts[0]
                const end = parts.pop() ?? ''
                const files = await AssetsHelper.get(start, [end])
                paths.splice(i, 1, ...files)
            } else {
                paths[i] = path
            }
            i++
        }
        // TODO: Need to make sure these paths work where they are supposed to be used.
        return paths
    }
}

export interface IAssetFilesCache {
    [key: string]: string[]
}