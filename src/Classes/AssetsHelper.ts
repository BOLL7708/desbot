import Utils from './Utils.js'

/**
 * Gets filled with all the filepaths from the `_assets` folder, to be referenced in configs.
 */
export default class AssetsHelper {
    static _filePaths: string[] = []
    static _filePathCache: IAssetFilesCache = {}

    /**
     * Load a selection of the available asset file-paths.
     * @param start The start of the filepath string, usually `_assets/SOMETHING/`.
     * @param end The end of the filepath string, usually for extensions, can be an array.
     * @returns A string array with matching file-paths.
     */
    static /* async */ get(start: string, end: string|string[]): /* Promise<string[]>*/ string[] {
        // TODO: Cannot be async until we stop using configs.
        // await this.getAll() // Make sure list is loaded.
        const extensions = Utils.ensureArray(end)
        const key = `${start}|${extensions.join('&')}`
        let files: string[]
        if(this._filePathCache.hasOwnProperty(key)) {
            files = this._filePathCache[key]
        } else {
            files = this._filePaths.filter((filePath) => {
                const FilePathLowerCase = (<String>filePath).toLowerCase()
                if(!FilePathLowerCase.startsWith(start.toLowerCase())) return false
                for(const extension of extensions) {
                    if(FilePathLowerCase.endsWith(extension.toLowerCase())) {
                        return true
                    }
                }
                return false
            })
            this._filePathCache[key] = files
        }
        return files
    }

    static async getAll(): Promise<string[]> {
        if(this._filePaths.length == 0) {
            const response = await fetch('_assets.php')
            if(response.ok) {
                const json = response.json()
                this._filePaths = await json
            }
        }
        return this._filePaths
    }
}

export interface IAssetFilesCache {
    [key: string]: string[]
}