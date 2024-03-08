import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class ConfigSign extends Data {
    direction: string = 'left'
    enabled: boolean = true
    fontColor: string = '#FFFFFF'
    fontFamily: string = 'Arial'
    fontSize: string = '150%'
    sizeHeight: number = 300
    sizeWidth: number = 240
    transitionDurationMs: number = 500

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigSign(),
            description: 'The sign can display a graphic with title and subtitle as a pop-in in the widget browser source.',
            documentation: {
                direction: 'From which side the Sign appears: `left, right, top, bottom`',
                enabled: 'Set if the Sign is enabled at all.',
                fontColor: 'Font color of the titles in the Sign, can be an HTML color or a hex value.',
                fontFamily: 'Font family of the titles in the Sign, can be any font that exists on the system.',
                fontSize: 'Font size of the titles in the Sign, in pixels.',
                sizeHeight: 'The full height of the sign pop-in.',
                sizeWidth: 'The full width of the sign pop-in.',
                transitionDurationMs: 'Amount of time it takes for the Sign to appear, in milliseconds.'
            }
        })
    }
}