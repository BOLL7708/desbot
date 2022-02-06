/**
 * Gets filled with all the filepaths from the `_assets` folder, to be referenced in configs.
 */
class AssetFiles {
    /**
     * Filled by PHP in index.php
     */
    static _filePaths = []

    /**
     * Load a selection of the available asset filepaths.
     * @param start The start of the filepath string, usually `_assets/SOMETHING/`.
     * @param end The end of the filepath string, usually for extensions, can be an array.
     * @returns A string array with matching filepaths.
     */
    static get(start: string, end: string|string[]): string[] {
        const extensions = Array.isArray(end) ? end : [end]
        const files = this._filePaths.filter(filePath => {
            const lcFilePath = filePath.toLowerCase()
            if(lcFilePath.startsWith(start.toLowerCase())) {
                for(const extension of extensions) {
                    if(lcFilePath.endsWith(extension.toLowerCase())) {
                        return filePath
                    }
                }
            }
        })
        return files
    }
}