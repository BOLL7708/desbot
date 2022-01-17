class TwitchFactory {
    static userColors: Record<number, string> = {}

    static buildMessage(data:string):ITwitchChatMessage {
        const re = /([\w]+)!?.*\.tmi\.twitch\.tv\s(.+)\s#([\w]+)\s:(.*)/g
        const matches:RegExpExecArray = re.exec(data)
        let matches2:RegExpExecArray = null
        let isAction = false
        if(matches != null) {
            const re2 = /^\u0001ACTION ([^\u0001]+)\u0001$/
            matches2 = re2.exec(matches[4] || '')
            isAction = matches2 != null
        }
        const message:ITwitchChatMessage = {
            data: data,
            username: (1 in (matches || [])) ? matches[1] : null,
            type: (2 in (matches || [])) ? matches[2] : null,
            channel: (3 in (matches || [])) ? matches[3] : null,
            text: isAction 
                ? (1 in (matches2  || []) ? matches2[1] : null) 
                : (4 in (matches  || []) ? matches[4] : null),
            isAction: isAction
        }
        return message
    }
    static isMessageOK(message: ITwitchChatMessage):boolean {
        return message.username != null && message.type != null && message.text != null
    }

    private static buildMessageProperties(data:string):ITwitchChatMessageProperties {
        const rows: string[] = data.split(';')
        const props:any = {}
        rows.forEach(row => { // Fill props with all incoming data pairs
            const [first, rest] = Utils.splitOnFirst('=', row)
            props[first] = rest
        })
        const properties: ITwitchChatMessageProperties = {
            data: data,
            '@badge-info': props['@badge-info'],
            badges: props.badges,
            bits: props.bits,
            'client-nonce': props['client-nonce'],
            color: props.color,
            'custom-reward-id': props['custom-reward-id'],
            'display-name': props['display-name'],
            emotes: this.buildMessageEmotes(props.emotes),
            flags: props.flags,
            id: props.id,
            mod: props.mod,
            'room-id': props['room-id'],
            subscriber: props.subscriber,
            'tmi-sent-ts': props['tmi-sent-ts'],
            turbo: props.turbo,
            'user-id': props['user-id'],
            'user-type': props['user-type']
        }
        return properties
    }

    private static buildMessageEmotes(data:string):ITwitchEmote[] {
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

    public static getEmotePositions(emotes: ITwitchEmote[]):ITwitchEmotePosition[] {
        const ranges: ITwitchEmotePosition[] = []
        if(emotes.length > 0) {
            emotes.forEach(emotes => ranges.push(...emotes.positions))
            ranges.sort((a,b) => { return b.start - a.start })
        }
        return ranges
    }

    public static buildMessageCmd(data:string):ITwitchMessageCmd {
        const [props, msg] = Utils.splitOnFirst(' :', data)
        const messageCmd:ITwitchMessageCmd = {
            properties: this.buildMessageProperties(props),
            message: this.buildMessage(msg)
        }
        const userId = messageCmd.properties['user-id']
        if(
            userId 
            && !this.userColors.hasOwnProperty(userId) 
            && messageCmd.properties.color
        ) {
            this.userColors[userId] = messageCmd.properties.color
        }
        return messageCmd
    }
}