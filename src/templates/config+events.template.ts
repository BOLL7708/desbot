import Config from '../statics/config.js'
import {ETTSFunction, ETTSType} from '../base/enums.js'

Config.events = {
    ...Config.events,
    /*
    .########.##.....##.########.##....##.########..######.
    .##.......##.....##.##.......###...##....##....##....##
    .##.......##.....##.##.......####..##....##....##......
    .######...##.....##.######...##.##.##....##.....######.
    .##........##...##..##.......##..####....##..........##
    .##.........##.##...##.......##...###....##....##....##
    .########....###....########.##....##....##.....######.
    */

    /*
    .######..######...####..
    ...##......##....##.....
    ...##......##.....####..
    ...##......##........##.
    ...##......##.....####..
    */
    'SetVoice': {
        triggers: {
            command: {
                entries: ['voice', 'setvoice'],
                helpInput: ['usertag', 'voice text'],
                helpText: 'Set the TTS voice for the tagged user, skip the tag to set your own.',
                permissions: { everyone: true }
            },
            reward: {
                title: 'Set Your Voice',
                cost: 5,
                prompt: 'Change your speaking voice, see the About section for options.',
                background_color: '#AAAAAA',
                is_user_input_required: true,
                should_redemptions_skip_request_queue: true
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserVoice },
            speech: {
                entries: '%targetOrUserTag now sounds like this.',
                voiceOfUser: '%targetOrUserLogin'
            },
            chat: { entries: 'TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice' }
        }
    },


    /*
    ..######...#######..##.....##.##.....##....###....##....##.########...######.
    .##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
    .##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
    .##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
    .##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
    .##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
    ..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
    */

    /*
    .######..######...####..
    ...##......##....##.....
    ...##......##.....####..
    ...##......##........##.
    ...##......##.....####..
    */
    'TtsOn': {
        triggers: {
            command: {
                entries: 'ttson',
                helpTitle: 'Text To Speech',
                helpText: 'Turn ON global TTS for Twitch chat.'
            }
        },
        actionsEntries: {
            speech: { entries: 'TTS enabled.' },
            tts: { function: ETTSFunction.Enable },
            rewardStates: { 'TtsOn': { state: false } }
        }
    },
    'TtsOff': {
        triggers: {
            command: {
                entries: 'ttsoff',
                helpText: 'Turn OFF global TTS for Twitch chat.'
            }
        },
        actionsEntries: {
            speech: { entries: 'TTS disabled.' },
            tts: { function: ETTSFunction.Disable },
            rewardStates: { 'Speak': { state: true } }
        }
    },
    'Silence': {
        triggers: {
            command: {
                entries: 'silence',
                helpText: 'Silence the current speaking TTS entry.'
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopCurrent }
        }
    },
    'TtsDie': {
        triggers: {
            command: {
                entries: ['die', 'ttsdie'],
                helpText: 'Empties the queue and silences what is currently spoken.'
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopAll }
        }
    },
    'TtsNick': {
        triggers: {
            command: {
                entries: ['nick', 'setnick'],
                helpInput: ['usertag', 'nick'],
                helpText: 'Set the TTS nick name for the tagged user, skip the tag to set your own, available for VIPs and subs.',
                permissions: {
                    VIPs: true,
                    subscribers: true
                },
                requireMinimumWordCount: 1
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserNick },
            speech: { entries: '%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute' }
        }
    },
    'TtsGetNick': {
        triggers: {
            command: {
                entries: 'getnick',
                helpInput: ['usertag'],
                helpText: 'Get the current TTS nick name for the tagged user, skip the tag to get your own, available for everyone.',
                permissions: { everyone: true },
                userCooldown: 30
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.GetUserNick },
            chat: { entries: 'TTS: "%lastTTSSetNickLogin" is called "%lastTTSSetNickSubstitute"' }
        }
    },
    'TtsClearNick': {
        triggers: {
            command: {
                entries: 'clearnick',
                helpInput: ['usertag'],
                helpText: 'Resets the TTS nick name for the tagged user, skip the tag to reset your own, available for, available for VIPs and subs.',
                permissions: {
                    VIPs: true,
                    subscribers: true
                }
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.ClearUserNick },
            speech: { entries: '%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute' }
        }
    },
    'TtsMute': {
        triggers: {
            command: {
                entries: 'mute',
                helpInput: ['usertag', 'reason text'],
                helpText: 'Mutes the tagged user so they will not speak with TTS, persists, reason is optional.'
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserDisabled },
            speech: { entries: '%targetTag has lost their voice.' }
        }
    },
    'TtsUnmute': {
        triggers: {
            command: {
                entries: 'unmute',
                helpInput: ['usertag'],
                helpText: 'Unmutes the tagged user so they can again speak with TTS.'
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserEnabled },
            speech: { entries: '%targetTag has regained their voice.' }
        }
    },
    'TtsGetVoice': {
        triggers: {
            command: {
                entries: 'getvoice',
                helpInput: ['usertag'],
                helpText: 'Get the current TTS voice for the tagged user, skip the tag to get your own, available for everyone.',
                permissions: { everyone: true },
                userCooldown: 30
            }
        },
        actionsEntries: {
            chat: { entries: 'TTS: %targetOrUserTag\'s voice is "%targetOrUserVoice"' }
        }
    },
    'TtsGender': {
        triggers: {
            command: {
                entries: 'gender',
                helpInput: ['usertag', 'f|m'],
                helpText: 'Swap the TTS voice gender for the tagged user, skip the tag to swap your own, available for VIPs & subs, optionally specify a gender.',
                permissions: {
                    VIPs: true,
                    subscribers: true
                }
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserGender },
            speech: {
                entries: '%targetOrUserTag now sounds like this',
                voiceOfUser: '%targetOrUserLogin'
            },
            chat: { entries: 'TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice' }
        }
    },
    'TtsVoices': {
        triggers: {
            command: {
                entries: ['tts', 'voices'],
                helpText: 'Posts information about how to set your voice.',
                permissions: { everyone: true },
                globalCooldown: 60 * 5
            }
        },
        actionsEntries: {
            chat: { entries: 'Preview Google TTS voices here, pick a Wavenet (mandatory) voice and use the name with the "Set Your Voice" reward 👉 https://cloud.google.com/text-to-speech/docs/voices' }
        }
    },

    /*
    .#####...######...####...######..######...####...##..##...####...#####...##..##.
    .##..##....##....##..##....##......##....##..##..###.##..##..##..##..##...####..
    .##..##....##....##........##......##....##..##..##.###..######..#####.....##...
    .##..##....##....##..##....##......##....##..##..##..##..##..##..##..##....##...
    .#####...######...####.....##....######...####...##..##..##..##..##..##....##...
    */
    'DictionarySetWord': {
        triggers: {
            command: {
                entries: ['word', 'setword'],
                helpInput: ['original', 'replacement'],
                helpText: 'Adds a word to the dictionary, comma separated replacement will randomize, prepend original with + to append or - to remove.',
                requireMinimumWordCount: 2
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetDictionaryEntry },
            speech: {
                entries: '%lastDictionaryWord is now said as %lastDictionarySubstitute',
                skipDictionary: true
            }
        }
    },
    'DictionaryGetWord': {
        triggers: {
            command: {
                entries: 'getword',
                helpText: 'Gets the current value for a dictionary entry, available for everyone.',
                permissions: { everyone: true }
            }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.GetDictionaryEntry },
            chat: { entries: 'Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"' }
        }
    },
    'DictionaryClearWord': {
        triggers: {
            command: {
                entries: 'clearword',
                requireExactWordCount: 1
            }
        },
        actionsEntries: {
            tts: {
                function: ETTSFunction.SetDictionaryEntry
            },
            speech: {
                entries: '%lastDictionaryWord was cleared from the dictionary',
                skipDictionary: true
            }
        }
    },

    /*
    ..####...##..##...####...######.
    .##..##..##..##..##..##....##...
    .##......######..######....##...
    .##..##..##..##..##..##....##...
    ..####...##..##..##..##....##...
    */
    'Chat': {
        triggers: {
            command: {
                entries: 'chat',
                helpTitle: 'Chat Stuff',
                helpInput: ['message'],
                helpText: 'Displays an anonymous text message as a VR overlay, available for VIPs.',
                permissions: { VIPs: true }
            }
        }
    },
    'ChatOn': {
        triggers: {
            command: {
                entries: 'chaton',
                helpText: 'Turns ON the chat popups in VR.'
            }
        }
    },
    'ChatOff': {
        triggers: {
            command: {
                entries: 'chatoff',
                helpText: 'Turns OFF the chat popups in VR.'
            }
        }
    },
    'PingOn': {
        triggers: {
            command: {
                entries: 'pingon',
                helpText: 'Turns ON the sound effect for messages if TTS is off or the message would be silent.'
            }
        }
    },
    'PingOff': {
        triggers: {
            command: {
                entries: 'pingoff',
                helpText: 'Turns OFF the sound effect for messages if TTS is off or the message would be silent.'
            }
        }
    },

    /*
    .##.......####....####..
    .##......##..##..##.....
    .##......##..##..##.###.
    .##......##..##..##..##.
    .######...####....####..
    */
    'LogOn': {
        triggers: {
            command: {
                entries: 'logon',
                permissions: { moderators: false }
            }
        }
    },
    'LogOff': {
        triggers: {
            command: {
                entries: 'logoff',
                permissions: { moderators: false }
            }
        }
    },

    'Quote': {
        triggers: {
            command: {
                entries: 'quote',
                helpTitle: 'System Functions',
                helpInput: ['usertag', 'quote text'],
                helpText: 'Save a quote by the tagger user, or if the tag is skipped, the streamer.'
            }
        }
    },
    'Scale': {
        triggers: {
            command: {
                entries: 'scale',
                helpInput: ['world scale|start scale', 'end scale', 'minutes'],
                helpText: 'Sets the world scale for the running VR game and cancels any sequence, range is 10-1000%, provide 3 numbers to start a sequence (from, to, minutes), no value resets to default.'
            }
        }
    },
    'Game': {
        triggers: {
            command: {
                entries: 'game',
                permissions: { everyone: true },
                globalCooldown: 3*60
            }
        },
        actionsEntries: {
            sign: {
                title: 'Current Game',
                image: '%gameBanner',
                subtitle: '%gameName\n%gamePrice',
                durationMs: 10000
            },
            chat: { entries: 'Game: %gameName - Released: %gameRelease - Price: %gamePrice - Link: %gameLink' }
        }
    },

    /*
    .#####...######..##...##...####...#####...#####....####..
    .##..##..##......##...##..##..##..##..##..##..##..##.....
    .#####...####....##.#.##..######..#####...##..##...####..
    .##..##..##......#######..##..##..##..##..##..##......##.
    .##..##..######...##.##...##..##..##..##..#####....####..
    */
    'UpdateRewards': {
        triggers: {
            command: {
                entries: 'update',
                permissions: { moderators: false }
            }
        }
    },
    'GameRewardsOn': {
        triggers: {
            command: {
                entries: 'rewardson',
                helpText: 'Turn ON game specific rewards.'
            }
        }
    },
    'GameRewardsOff': {
        triggers: {
            command: {
                entries: 'rewardsoff',
                helpText: 'Turn OFF game specific rewards.'
            }
        }
    },
    'RefundRedemption': {
        triggers: {
            command: {
                entries: 'refund',
                helpInput: ['usertag'],
                helpText: 'Refund the last reward in the redemptions queue for the tagged user.',
                globalCooldown: 30
            }
        }
    },
    'ClearRedemptions': {
        triggers: {
            command: {
                entries: 'clearqueue',
                permissions: { moderators: false },
                globalCooldown: 60
            }
        }
    },
    'ResetIncrementingEvents': {
        triggers: {
            command: {
                entries: 'resetinc',
                permissions: { moderators: false },
                globalCooldown: 20
            }
        }
    },
    'ResetAccumulatingEvents': {
        triggers: {
            command: {
                entries: 'resetacc',
                permissions: { moderators: false },
                globalCooldown: 20
            }
        }
    },

    /*
    ..####...##..##...####...######..######..##...##.
    .##.......####...##........##....##......###.###.
    ..####.....##.....####.....##....####....##.#.##.
    .....##....##........##....##....##......##...##.
    ..####.....##.....####.....##....######..##...##.
    */    
    'ReloadWidget': {
        triggers: {
            command: {
                entries: 'reload',
                permissions: { moderators: false }
            }
        }
    },
    'ChannelTrophyStats': {
        triggers: {
            command: {
                entries: 'trophy',
                permissions: { moderators: false }
            }
        }
    },
    'Clips': {
        triggers: {
            command: {
                entries: 'clips',
                permissions: { moderators: false }
            }
        }
    },
    'GameReset': {
        triggers: {
            command: {
                entries: 'nogame',
                permissions: { moderators: false }
            }
        }
    },
    'Raid': {
        triggers: {
            command: {
                entries: 'raid',
                helpInput: ['usertag|channel link'],
                helpText: 'Will initiate a raid if a valid user tag or channel link is provided.'
            }
        }
    },
    'Unraid': {
        triggers: {
            command: {
                entries: 'unraid',
                helpText: 'Will cancel the currently active raid.'
            }
        }
    },
    'RemoteOn': {
        triggers: {
            command: {
                entries: 'remoteon',
                helpText: 'Turn ON remote channel commands.'
            }
        }
    },
    'RemoteOff': {
        triggers: {
            command: {
                entries: 'remoteoff',
                helpText: 'Turn OFF remote channel commands.'
            }
        }
    },
    'HelpToDiscord': {
        triggers: {
            command: {
                entries: 'posthelp',
                permissions: { moderators: false }
            }
        },
        actionsEntries: {
            speech: { entries: 'Help was posted to Discord' }
        }
    },
    'HelpToChat': {
        triggers: {
            command: {
                entries: 'help',
                helpInput: ['command'],
                helpText: 'Posts help information about specific commands. Come on now, this is the help! Why even ask about help about the help! Sheesh!',
                permissions: { subscribers: true, VIPs: true },
                userCooldown: 30
            }
        }
    },

    /*
    .######..##..##...####...##...##..#####...##......######...####..
    .##.......####...##..##..###.###..##..##..##......##......##.....
    .####......##....######..##.#.##..#####...##......####.....####..
    .##.......####...##..##..##...##..##......##......##..........##.
    .######..##..##..##..##..##...##..##......######..######...####..
    */
    'Say': { // Announces something with the TTS
        triggers: {
            command: {
                entries: 'say',
                helpInput: ['message text'],
                helpText: 'Will read the message aloud, without saying from whom, available for VIPs.',
                permissions: { VIPs: true }
            }
        },
        actionsEntries: {
            speech: { entries: '%userInput' }
        }
    },
    'Lurk': { // Used to announce that a user is lurking
        triggers: {
            command: {
                entries: 'lurk',
                helpText: 'Posts a lurk message, available for everyone.',
                permissions: { everyone: true },
                userCooldown: 60 * 5
            }
        },
        actionsEntries: {
            chat: { entries: 'Just to let you know, %userTag will be lurking! %userInput' }
        }
    },
    'Label': { // Writes a label to the disk that can be used as a source
        triggers: {
            command: {
                entries: ['label', 'txt'],
                helpInput: ['message'],
                helpText: 'Sets the text of the on-screen bottom label.'
            }
        },
        actionsEntries: {
            speech: { entries: 'Label set to "%userInput"' },
            label: {
                fileName: 'obs_info_label.txt',
                text: '%userInput'
            }
        }
    },
    'Todo': { // Puts a post in Discord using the Discord webhook with the same key
        triggers: {
            command: {
                entries: 'todo',
                helpInput: ['message'],
                helpText: 'Posts a to-do note in the to-do Discord channel.'
            }
        },
        actionsEntries: {
            speech: { entries: 'To do list appended with: %userInput' },
            discord: { entries: '-> %userInput' }
        }
    },
    'ShoutOut': { // Used to promote another user
        triggers: {
            command: {
                entries: ['so', 'shoutout'],
                helpInput: ['usertag'],
                helpText: 'Posts a shout-out message for a user, useful for an incoming raider.',
                globalCooldown: 30,
                requireUserTag: true
            }
        },
        actionsEntries: {
            chat: { entries: 'Say hello to %targetTag who last streamed "%targetGame", considering following! (their channel: %targetLink)' }
        }
    },
    'EndStream': { // Runs multiple commands suitable for when ending a stream
        triggers: {
            command: {
                entries: 'endstream',
                permissions: { moderators: false }
            }
        },
        actionsEntries: {
            speech: {
                entries: 'Running stream end tasks'
            },
            events: {
                keyEntries: [
                    'ChannelTrophyStats',
                    'Clips',
                    'ClearRedemptions',
                    'ResetIncrementingEvents',
                    'ResetAccumulatingEvents'
                ],
                interval: 20
            }
        }
    },
    'WidgetLink': {
        triggers: {
            command: {
                entries: 'widget',
                helpText: 'Posts a link to the Streaming Widget Github page.',
                permissions: { everyone: true },
                globalCooldown: 60 * 5
            }
        },
        actionsEntries: {
            chat: { entries: 'Streaming Widget Repository -> https://github.com/BOLL7708/streaming_widget' }
        }
    },
    'UserWikiLink': { // A link to the user wiki for the widget
        triggers: {
            command: {
                entries: 'wiki',
                helpText: 'Posts a link to the Streaming Widget wiki.',
                permissions: { everyone: true },
                globalCooldown: 60 * 5
            }
        },
        actionsEntries: {
            chat: { entries: 'Streaming Widget Wiki -> https://github.com/BOLL7708/streaming_widget_wiki/wiki' }
        }
    },

    /*
    .########..########.##......##....###....########..########...######.
    .##.....##.##.......##..##..##...##.##...##.....##.##.....##.##....##
    .##.....##.##.......##..##..##..##...##..##.....##.##.....##.##......
    .########..######...##..##..##.##.....##.########..##.....##..######.
    .##...##...##.......##..##..##.#########.##...##...##.....##.......##
    .##....##..##.......##..##..##.##.....##.##....##..##.....##.##....##
    .##.....##.########..###..###..##.....##.##.....##.########...######.
    */

    /*
    .######..######...####..
    ...##......##....##.....
    ...##......##.....####..
    ...##......##........##.
    ...##......##.....####..
    */
    'Speak': {
        triggers: {
            reward: {
                title: 'Speak Once',
                cost: 5,
                prompt: 'Your message is read aloud.',
                background_color: '#AAAAAA',
                is_user_input_required: true,
                should_redemptions_skip_request_queue: true
            }
        },
        actionsEntries: {
            speech: {
                voiceOfUser: '%userLogin',
                entries: '%userInput',
                type: ETTSType.Said
            }
        }
    },

    /*
    ..####...##..##...####...##..##..##..##..######..##......######..#####....####...#####...##..##..##..##.
    .##..##..##..##..##..##..###.##..###.##..##......##........##....##..##..##..##..##..##..##..##...####..
    .##......######..######..##.###..##.###..####....##........##....#####...##..##..#####...######....##...
    .##..##..##..##..##..##..##..##..##..##..##......##........##....##..##..##..##..##......##..##....##...
    ..####...##..##..##..##..##..##..##..##..######..######....##....##..##...####...##......##..##....##...
    */
    'ChannelTrophy': {
        options: {
            rewardIgnoreUpdateCommand: true
        },
        triggers: {
            reward: {
                title: 'Held by nobody!',
                cost: 1,
                prompt: 'Become the Channel Trophy holder! You hold the trophy until someone else pays the ever increasing (+1) price!',
                background_color: '#000000',
                is_max_per_stream_enabled: true,
                max_per_stream: 10000,
                is_global_cooldown_enabled: true,
                global_cooldown_seconds: 15
            }
        },
        actionsEntries: {
            audio: {
                srcEntries: '_assets/random_audio.wav',
                volume: 0.75
            },
            sign: {
                durationMs: 10000,
                title: 'The trophy was grabbed!',
                subtitle: '%userName',
            }
        }
    }
}