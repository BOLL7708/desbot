import Constants from '../../bot/Constants/Constants.mts'
import Utils from '../../bot/Utils/Utils.mts'

export default class BrowserUtils {
   /**
    * Load image into element with promise
    */
   static makeImage(urlOrData: string): Promise<HTMLImageElement|null> {
      return new Promise((resolve, reject) => {
         if(Utils.isDataUrl(urlOrData) || Utils.isUrl(urlOrData)) {
            const img = new Image()
            img.onload = ()=>{ resolve(img) }
            img.src = urlOrData
         } else {
            resolve(null)
         }
      })
   }

   static getElement<T>(id: string): T|undefined {
      return (document.querySelector(id) as T|null) ?? undefined
   }

   static getAuth(): string {
      return localStorage.getItem(Constants.LOCAL_STORAGE_KEY_AUTH+BrowserUtils.getCurrentPath()) ?? ''
   }
   static getAuthInit(additionalHeaders: HeadersInit = {}): RequestInit {
      return {
         headers: {Authorization: BrowserUtils.getAuth(), ...additionalHeaders}
      }
   }

   static clearAuth(): void {
      localStorage.removeItem(Constants.LOCAL_STORAGE_KEY_AUTH+BrowserUtils.getCurrentPath())
   }

   static getCurrentPath(): string {
      let path = window.location.pathname;
      const pathArray = path.split("/");
      while (pathArray.length && (path.includes(".") || path.length == 0)) {
         pathArray.pop();
         path = pathArray.join("/");
      }
      if (path.endsWith("/")) path = path.slice(0, -1);
      return path;
   }

   static async writeToClipboard(data: any|undefined): Promise<boolean> {
      if(data === undefined) return false
      const value = typeof data == 'string' ? data : JSON.stringify(data)
      try {
         await navigator.clipboard.writeText(value);
         return true
      } catch (err) {
         return false
      }
   }

   static async readFromClipboard(parseJson: boolean = false): Promise<any|undefined> {
      try {
         const data = await navigator.clipboard.readText();
         return parseJson ? JSON.parse(data) : data;
      } catch (err) {
         return undefined
      }
   }

   static setUrlParam(pairs: { [param: string]: string }) {
      const urlParams = Utils.getUrlParams()
      for(const [param, value] of Object.entries(pairs)) {
         urlParams.set(param, value)
      }
      window.history.replaceState(null, '', `?${urlParams.toString()}`);
   }
}
