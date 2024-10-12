import Utils from '../../Utils/Utils.mts'
import {ITwitchEventSubEmote} from '../Api/TwitchEventSub.mts'
import {INumberDictionary} from '../../Interfaces/igeneral.mts'
import Twitch from '../Api/Twitch.mts'

export default class TwitchFactory {
    private static buildMessage(data:string): ITwitchChatMessage {
        const re = /(\w+)!?.*\.tmi\.twitch\.tv\s([A-Z]+)\s#*(.+?)\s:(.*)/g
        const matches: RegExpExecArray|null = re.exec(data)
        let matches2:RegExpExecArray|null = null
        let isAction = false
        if(matches != null) {
            const re2 = /^\u0001ACTION ([^\u0001]+)\u0001$/
            matches2 = re2.exec(matches[4] || '')
            isAction = matches2 != null
        }

        let messageText = isAction 
            ? (matches2 != null && 1 in matches2 ? matches2[1] : undefined) // Trimmed message after matching action
            : (matches != null && 4 in matches ? matches[4] : undefined) // Message
        
        /**
         * Constructs a TwitchChatMessage object from a raw IRC message.
         * `(x in [])` checks if that index is present in the array.
         */
        const message: ITwitchChatMessage = {
            data: data,
            username: (matches != null && 1 in matches) ? matches[1] : undefined,
            type: (matches != null && 2 in matches) ? matches[2] : undefined,
            channel: (matches != null && 3 in matches) ? matches[3].replace('#', '') : undefined,
            text: messageText,
            isAction: isAction
        }
        return message
    }
    static isMessageOK(message: ITwitchChatMessage):boolean {
        return message.username != undefined && message.type != undefined && message.text != undefined
    }

    private static buildMessageProperties(data:string): ITwitchChatMessageProperties {
        const rows: string[] = data.split(';')
        const props:any = {}
        rows.forEach(row => { // Fill props with all incoming data pairs
            const [first, rest] = Utils.splitOnFirst('=', row)
            props[first] = rest
        })
        const properties: ITwitchChatMessageProperties = {
            data: data,

            // Standard
            '@badge-info': props['@badge-info'],
            badges: props.badges,
            bits: props.bits,
            'client-nonce': props['client-nonce'],
            color: props.color,
            'custom-reward-id': props['custom-reward-id'],
            'display-name': props['display-name'],
            emotes: this.buildMessageEmotes(props.emotes),
            'first-msg': props['first-msg'],
            flags: props.flags,
            id: props.id,
            mod: props.mod,
            'room-id': props['room-id'],
            subscriber: props.subscriber,
            'tmi-sent-ts': props['tmi-sent-ts'],
            turbo: props.turbo,
            'user-id': props['user-id'],
            'user-type': props['user-type'],

            // Whisper specific
            '@badges': props['@badges'],
            'message-id': props['message-id'],
            'thread-id': props['thread-id'],

            // Thread
            'reply-parent-display-name': props['reply-parent-display-name'],
            'reply-parent-msg-body': props['reply-parent-msg-body'],
            'reply-parent-msg-id': props['reply-parent-msg-id'],
            'reply-parent-user-id': props['reply-parent-user-id'],
            'reply-parent-user-login': props['reply-parent-user-login']
        }
        return properties
    }

    private static buildMessageEmotes(data:string): ITwitchEmote[] {
        const emoteStrings:string[] = data ? data.split('/') : []
        const result:ITwitchEmote[] = emoteStrings.map(str => { 
            const [id, rest]:string[] = str.split(':')
            const positionPairs:string[] = (rest && rest.indexOf(',') > -1) 
                ? rest.split(',') 
                : [rest]
            const positions:ITwitchEmotePosition[] = positionPairs.map(pair => {
                const [start, end]:string[] = pair.split('-')
                const position: ITwitchEmotePosition = {start: parseInt(start), end: parseInt(end)}
                return position
            })
            return {id: id, positions: positions}
        })
        return result
    }

    public static getEmotePositions(emotes: ITwitchEmote[]): ITwitchEmotePosition[] {
        const ranges: ITwitchEmotePosition[] = []
        if(emotes.length > 0) {
            emotes.forEach(emotes => ranges.push(...emotes.positions))
            ranges.sort((a,b) => { return b.start - a.start })
        }
        return ranges
    }
    public static getEventSubEmotePositions(emotes: ITwitchEventSubEmote[]): ITwitchEmotePosition[] {
        const twitchEmotes = emotes.map(emote => {
            return { id: emote.id.toString(), positions: [{ start: emote.begin, end: emote.end}] } as ITwitchEmote
        })
        return this.getEmotePositions(twitchEmotes)
    }

    static getEmoteImages(emotes: ITwitchEmote[], size: number = 1): INumberDictionary {
        size = Math.max(1, Math.min(3, Math.round(Math.abs(size))))
        return Object.fromEntries(emotes.map((emote)=>[`${Twitch.EMOTE_URL}/${emote.id}/${size}.0`, emote.positions.length]))
    }

    public static buildMessageCmd(data:string): ITwitchMessageCmd {
        const [props, msg] = Utils.splitOnFirst(' :', data)
        const messageCmd: ITwitchMessageCmd = {
            properties: this.buildMessageProperties(props),
            message: this.buildMessage(msg)
        }

        // Will truncate the default user tag at the start if it is a response to a thread.
        if(messageCmd.properties['reply-parent-display-name'] != null) {
            const replyParentUserDisplayName = messageCmd.properties['reply-parent-display-name']
            let text = messageCmd.message.text ?? ''
            messageCmd.message.text = text.startsWith(`@${replyParentUserDisplayName} `)
                ? text.substring(replyParentUserDisplayName.length+2) 
                : text
        }
        return messageCmd
    }
}

export interface ITwitchMessageCmd {
    properties: ITwitchChatMessageProperties
    message: ITwitchChatMessage
}
export interface ITwitchChatMessage {
    data: string
    username?: string
    channel?: string
    type?: string
    text?: string
    isAction: boolean
}
export interface ITwitchChatMessageProperties {
    // Standard
    data: string
    '@badge-info'?: string
    badges?: string
    'client-nonce'?: string
    color?: string
    'custom-reward-id'?: string
    'display-name'?: string
    emotes?: ITwitchEmote[]
    'first-msg'?: string
    flags?: string
    id?: string
    mod?: string
    'room-id'?: string
    subscriber?: string
    'tmi-sent-ts'?: string
    turbo?: string
    'user-id'?: string
    'user-type'?: string
    bits?: string

    // Whisper
    '@badges'?: string
    'message-id'?: string
    'thread-id'?: string

    // Thread
    'reply-parent-display-name'?: string
    'reply-parent-msg-body'?: string
    'reply-parent-msg-id'?: string
    'reply-parent-user-id'?: string
    'reply-parent-user-login'?: string

    [x: string]: any
}

export interface ITwitchEmote {
    id: string,
    positions: ITwitchEmotePosition[]
}
export interface ITwitchEmotePosition {
    start: number
    end: number
}