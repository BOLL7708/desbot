import Utils from '../widget/utils.js'

/**
 * Gets filled with all the filepaths from the `_assets` folder, to be referenced in configs.
 */
export default class AssetFiles {
    /**
     * Filled by PHP in widget.php
     */
    static _filePaths = []
    static _filePathCache: IAssetFilesCache = {}

    /**
     * Load a selection of the available asset filepaths.
     * @param start The start of the filepath string, usually `_assets/SOMETHING/`.
     * @param end The end of the filepath string, usually for extensions, can be an array.
     * @returns A string array with matching filepaths.
     */
    static get(start: string, end: string|string[]): string[] {
        const extensions = Utils.ensureArray(end)
        const key = `${start}|${extensions.join('&')}`
        let files: string[]
        if(this._filePathCache.hasOwnProperty(key)) {
            files = this._filePathCache[key]
        } else {
            files = this._filePaths.filter((filePath) => {
                const lcFilePath = (<String>filePath).toLowerCase()
                if(lcFilePath.startsWith(start.toLowerCase())) {
                    for(const extension of extensions) {
                        if(lcFilePath.endsWith(extension.toLowerCase())) {
                            return filePath
                        }
                    }
                }
            })
        }
        return files
    }
}

export interface IAssetFilesCache {
    [key: string]: string[]
}