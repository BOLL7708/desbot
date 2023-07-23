import TopBar from './TopBar.js'

export default class PageUtils {

    static async attach() {
        TopBar.attachSignOutClick('#topBarSignOutLink')
        TopBar.attachPageModeClick('#topBarPageModeLink')
        TopBar.attachFavorites('#favorites-bar').then()
    }
}