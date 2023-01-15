import BaseDataObject, {BaseDataObjectMap} from './BaseDataObject.js'

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
        this.addInstance(new ConfigOpenVR2WS())
        this.addInstance(new ConfigDiscord())
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
    /**
     * The port that is set in the OpenVR2WS application.
     */
    port: number = 7708
}

/**
 * Settings for sending things to Discord channels.
 * TODO: We need to make something that can associate help texts with class properties...
 *  Maybe get all keys off a class, make that a new type, and fill a help dictionary?
 */
export class ConfigDiscord extends BaseDataObject {
    /**
     * Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.
     *
     * Note: This has to be a hex color to work with Discord.
     */
    screenshotEmbedColorRemote: string = '#000000'

    /**
     * Embed highlight color for manual screenshots.
     *
     * Note: This has to be a hex color to work with Discord.
     */
    screenshotEmbedColorManual: string = '#FFFFFF'

    /**
     * Prefix added to cheer messages in the log.
     *
     * Note: This prefix should include a trailing space if you want it to be separated from the message.
     */
    prefixCheer: string = '*Cheer*: '

    /**
     * Prefix added to reward messages in the log.
     *
     * Note: This prefix should include a trailing space if you want it to be separated from the message.
     */
    prefixReward: string = '*Reward*: '
}