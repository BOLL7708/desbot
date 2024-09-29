import TopBar from './TopBar.mts'

export default class PageUtils {

    static async attach() {
        TopBar.attachSignOutClick('#topBarSignOutLink')
        TopBar.attachFavorites('#favorites-bar').then()
    }
}