import BaseDataObject, {BaseDataObjectMap} from './BaseDataObject.js'
import Config from './Config.js'

/*
 * TODO: For config classes to make sense, we should flatten them as much as possible.
 *  Make sub-dictionaries surface level and then have the editor split on capital letter.
 *  This means { data: { other: 1, more: 2 } } will be { dataOther: 1, dataMore: 2 }.
 *  The exception is when the array or dictionary fits an arbitrary number of items,
 *  then we should make them contain sub-classes, and the editor can add more instances.
 */

export default class ConfigObjects extends BaseDataObjectMap {
    constructor() {
        super()
        // this.addInstance(new ConfigExample())
        this.addInstance(new ConfigOpenVR2WS(), {
            port: 'The port that is set in the OpenVR2WS application.'
        })
        this.addInstance(new ConfigDiscord(), {
            prefixReward: 'Prefix added to reward messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
            prefixCheer: 'Prefix added to cheer messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
            screenshotEmbedColorRemote: 'Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.\n\nNote: This has to be a hex color to work with Discord.',
            screenshotEmbedColorManual: 'Embed highlight color for manual screenshots.\n\nNote: This has to be a hex color to work with Discord.'
        })
        this.addInstance(new ConfigSign(), {
            enabled: 'Set if the Sign is enabled at all.',
            width: 'The full width of the sign pop-in.',
            height: 'The full height of the sign pop-in.',
            transitionDurationMs: 'Amount of time it takes for the Sign to appear, in milliseconds.',
            fontFamily: 'Font family of the titles in the Sign, can be any font that exists on the system.',
            fontColor: 'Font color of the titles in the Sign, can be an HTML color or a hex value.',
            fontSize: 'Font size of the titles in the Sign, in pixels.',
            direction: 'From which side the Sign appears: `left, right, top, bottom`'
        })
        this.addInstance(new ConfigRelay(), {
            port: 'The port that is set in the WSRelay application.',
            streamDeckChannel: 'The channel to use for the Stream Deck plugin. (WIP)'
        })
    }
}

export class ConfigExample extends BaseDataObject {
    public singleValue: string = ''
    // TODO: Needs to add interface to add elements to array
    public arrayOfSubClasses: ConfigExampleSub[] = [
        new ConfigExampleSub(),
        new ConfigExampleSub()
    ]
    // TODO: Needs to add interface to add elements to dictionary
    public dictionaryWithSubClasses: { [key:string]: ConfigExampleSub } = {
        ['dictionaryEntry1']: new ConfigExampleSub(),
        ['dictionaryEntry2']: new ConfigExampleSub()
    }
}

export class ConfigExampleSub {
    public subClassValue: string = ''
}

/**
 * Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS.
 */
export class ConfigOpenVR2WS extends BaseDataObject {
    port: number = 7708
}

/**
 * Settings for sending things to Discord channels.
 */
export class ConfigDiscord extends BaseDataObject {
    screenshotEmbedColorRemote: string = '#000000'
    screenshotEmbedColorManual: string = '#FFFFFF'
    prefixCheer: string = '*Cheer*: '
    prefixReward: string = '*Reward*: '
}

/**
 * The sign can display a graphic with title and subtitle as a pop-in in the widget browser source.
 */
export class ConfigSign extends BaseDataObject {
    enabled: boolean = true
    width: number = 240
    height: number = 300
    transitionDurationMs: number = 500
    fontFamily: string = 'Arial'
    fontColor: string = '#FFFFFF'
    fontSize: string = '150%'
    direction: string = 'left'
}

/**
 * Settings to connect to the WSRelay accessory application.
 */
export class ConfigRelay extends BaseDataObject {
    port: number = 7788
    streamDeckChannel: string = 'streaming_widget'
}