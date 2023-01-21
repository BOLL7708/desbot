import BaseDataObject, {BaseDataObjectMap} from './BaseDataObject.js'
import Config from './Config.js'
import PhilipsHue from './PhilipsHue.js'
import {IStringDictionary} from '../Interfaces/igeneral.js'

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
        this.addInstance(
            new ConfigOpenVR2WS(),
            'Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS.',
            {
                port: 'The port that is set in the OpenVR2WS application.'
            }
        )
        this.addInstance(
            new ConfigDiscord(),
            'Settings for sending things to Discord channels.',
            {
                prefixCheer: 'Prefix added to cheer messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                prefixReward: 'Prefix added to reward messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                screenshotEmbedColorManual: 'Embed highlight color for manual screenshots.\n\nNote: This has to be a hex color to work with Discord.',
                screenshotEmbedColorRemote: 'Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.\n\nNote: This has to be a hex color to work with Discord.'
            }
        )
        this.addInstance(
            new ConfigSign(),
            'The sign can display a graphic with title and subtitle as a pop-in in the widget browser source.',
            {
                direction: 'From which side the Sign appears: `left, right, top, bottom`',
                enabled: 'Set if the Sign is enabled at all.',
                fontColor: 'Font color of the titles in the Sign, can be an HTML color or a hex value.',
                fontFamily: 'Font family of the titles in the Sign, can be any font that exists on the system.',
                fontSize: 'Font size of the titles in the Sign, in pixels.',
                sizeHeight: 'The full height of the sign pop-in.',
                sizeWidth: 'The full width of the sign pop-in.',
                transitionDurationMs: 'Amount of time it takes for the Sign to appear, in milliseconds.'
            }
        )
        this.addInstance(
            new ConfigRelay(),
            'Settings to connect to the WSRelay accessory application.',
            {
                port: 'The port that is set in the WSRelay application.',
                streamDeckChannel: 'The channel to use for the Stream Deck plugin. (WIP)'
            }
        )
        this.addInstance(
            new ConfigPhilipsHue(),
            'Control Philips Hue lights or sockets.',
            {
                serverPath: 'Local IP address of the Philips Hue bridge, start with the protocol: http://'
            }
        )
        this.addInstance(
            new ConfigExample(),
            'Test config for deeper structures.',
            {
                singleValue: 'Hello!',
                arrayOfStrings: 'Just strings derp.',
                arrayOfArraysOfStrings: 'This will go boom...',
                dictionaryOfStrings: 'Just strings with keys',
                arrayOfSubClasses: 'A cake!',
                dictionaryWithSubClasses: 'Oh my...'
            },
            {
                arrayOfStrings: 'string',
                arrayOfArraysOfStrings: 'string',
                dictionaryOfStrings: 'string',
                arrayOfSubClasses: new ConfigExampleSub().constructor.name
            }
        )
    }
}

export class ConfigExample extends BaseDataObject {
    public singleValue: string = ''
    public arrayOfStrings: string[] = [
        'one', 'two', 'three'
    ]
    public arrayOfArraysOfStrings: string[][] = [
        ['hello', 'there'],
        ['and', 'another']
    ]
    public dictionaryOfStrings: IStringDictionary = {
        hello: 'Testing!',
        bye: 'More tests'
    }
    public arrayOfSubClasses: ConfigExampleSub[] = [
        new ConfigExampleSub(),
        new ConfigExampleSub()
    ]
    // TODO: Needs to add interface to add elements to dictionary
    public dictionaryWithSubClasses: { [key:string]: ConfigExampleSub } = {
        dictionaryEntry1: new ConfigExampleSub(),
        dictionaryEntry2: new ConfigExampleSub()
    }
}

export class ConfigExampleSub {
    public subClassValue: string = ''
}

export class ConfigOpenVR2WS extends BaseDataObject {
    port: number = 7708
}

export class ConfigDiscord extends BaseDataObject {
    prefixCheer: string = '*Cheer*: '
    prefixReward: string = '*Reward*: '
    screenshotEmbedColorManual: string = '#FFFFFF'
    screenshotEmbedColorRemote: string = '#000000'
}

export class ConfigSign extends BaseDataObject {
    direction: string = 'left'
    enabled: boolean = true
    fontColor: string = '#FFFFFF'
    fontFamily: string = 'Arial'
    fontSize: string = '150%'
    sizeHeight: number = 300
    sizeWidth: number = 240
    transitionDurationMs: number = 500
}

export class ConfigRelay extends BaseDataObject {
    port: number = 7788
    streamDeckChannel: string = 'streaming_widget'
}

export class ConfigPhilipsHue extends BaseDataObject {
    serverPath: string = 'http://'
}