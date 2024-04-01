import Utils from './Utils.js'
import {start} from 'node:repl'

/**
 * Gets filled with all the file-paths from the `_user/assets` folder, to be referenced in the editor and for serving.
 */
export default class AssetsHelper {
    static rootPath: string = '../_user/assets/'
    private static _filePaths: string[] = []
    private static _filePathCache: IAssetFilesCache = {}

    /**
     * Load a selection of the available asset file-paths.
     * @param start The start of the filepath string, usually `_user/assets/SOMETHING/`.
     * @param end The ends of the filepath string, usually a selection of extensions.
     * @returns A string array with matching file-paths.
     */
    static async get(start: string, end: string[]): Promise<string[]> {
        await this.getAll() // Make sure list is loaded.

        // TODO: Remove local legacy filepath, eventually this should be replaced in the database by a migration.
        start = start.replace(/^_assets[\\/]/g, '')

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

    static async getAll(): Promise<string[]> {
        if(this._filePaths.length == 0) {
            const response = await fetch('_assets.php')
            if(response.ok) {
                const json = response.json()
                let filePaths =  await json
                filePaths = filePaths.map((filePath: string) => {
                    // Remove local filepath
                    return filePath.replace(/^.*assets[\\/]/g, '')
                })
                this._filePaths = filePaths
            } else {
                console.error('Failed to load assets from server.')
            }
        }
        return this._filePaths
    }

    /**
     * Will replace trailing slash to wildcard, will replace wildcard with all matching folder, will add relative root path to work in browser.
     * @param paths
     */
    static async preparePathsForUse(paths: string[]): Promise<string[]> {
        let i = 0
        for(let path of paths) {

            // TODO: Remove legacy local file-path, replace with migration later.
            path = path.replace(/^_assets[\\/]/g, '')

            //  Then load files from that and replaces the entry with the found files.
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
        paths = paths.map((path) => {
            return AssetsHelper.rootPath + path
        })
        return paths
    }
}

export interface IAssetFilesCache {
    [key: string]: string[]
}