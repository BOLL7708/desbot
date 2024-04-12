import Utils from '../../Shared/Classes/Utils.js'
import Constants from '../../Shared/Classes/Constants.js'

document.body.onload = ()=>{
    const pageContainer = document.querySelector('#page-container') as HTMLDivElement
    const sideBarDiv = document.querySelector('#side-bar') as HTMLDivElement
    const margin: number = 12
    const localStorageKey = Constants.LOCAL_STORAGE_KEY+Utils.getCurrentPath()+'_sideBarWidth'
    let currentWidth: number = parseInt(localStorage.getItem(localStorageKey) ?? '0') // TODO: Change this to use the database so it can be shared between the Node building pages and the editor where we change it.
    function canDrag(x: number) {
        const [grow, shrink, basis] = sideBarDiv.style.flex.split(' ')
        const width = parseInt(basis)
        return x > (width - margin) && x < (width + margin)
    }
    if(sideBarDiv) {
        if(currentWidth > 0) sideBarDiv.style.flex = `0 0 ${currentWidth}px`
        let isDragging = false
        pageContainer.onmousemove = (event)=>{
            if(isDragging) {
                sideBarDiv.style.flex = `0 0 ${event.x}px`
                currentWidth = event.x
            } else {
                if(canDrag(event.x)) {
                    pageContainer.style.cursor = 'ew-resize'
                    sideBarDiv.style.borderColor = '#000'
                } else {
                    pageContainer.style.cursor = 'default'
                    sideBarDiv.style.borderColor = ''
                }
            }
        }
        pageContainer.onmousedown = (event)=>{
            if(canDrag(event.x)) {
                pageContainer.style.cursor = 'ew-resize'
                isDragging = true
                sideBarDiv.style.borderColor = ''
            }
        }
        pageContainer.onmouseup = (event)=>{
            pageContainer.style.cursor = 'default'
            isDragging = false
            sideBarDiv.style.borderColor = ''
            localStorage.setItem(localStorageKey, currentWidth.toString())
        }
    } else {
        console.error('Could not find side bar div')
    }
}