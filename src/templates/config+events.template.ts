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
            command: { entries: 'ttson' }
        },
        actionsEntries: {
            speech: { entries: 'TTS enabled.' },
            tts: { function: ETTSFunction.Enable },
            rewardStates: { 'Speak': { state: false } }
        }
    },
    'TtsOff': {
        triggers: {
            command: { entries: 'ttsoff' }
        },
        actionsEntries: {
            speech: { entries: 'TTS disabled.' },
            tts: { function: ETTSFunction.Disable },
            rewardStates: { 'Speak': { state: true } }
        }
    },
    'Silence': {
        triggers: {
            command: { entries: 'silence' }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopCurrent }
        }
    },
    'TtsDie': {
        triggers: {
            command: { entries: ['die', 'ttsdie'] }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopAll }
        }
    },
    'TtsNick': {
        triggers: {
            command: {
                entries: ['nick', 'setnick'],
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
                permissions: { everyone: true }
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
            command: { entries: 'mute' }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserDisabled },
            speech: { entries: '%targetTag has lost their voice.' }
        }
    },
    'TtsUnmute': {
        triggers: {
            command: { entries: 'unmute' }
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
                permissions: { everyone: true }
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
                permissions: { everyone: true },
                globalCooldown: 60 * 5
            }
        },
        actionsEntries: {
            chat: { entries: 'Preview Google TTS voices here, pick a Wavenet (mandatory) voice and use the name with the "Set Your Voice" reward: https://cloud.google.com/text-to-speech/docs/voices' }
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
                permissions: { VIPs: true }
            }
        }
    },
    'ChatOn': {
        triggers: {
            command: { entries: 'chaton' }
        }
    },
    'ChatOff': {
        triggers: {
            command: { entries: 'chatoff' }
        }
    },
    'PingOn': {
        triggers: {
            command: { entries: 'pingon' }
        }
    },
    'PingOff': {
        triggers: {
            command: { entries: 'pingoff' }
        }
    },
    'Quote': {
        triggers: {
            command: { entries: 'quote' }
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

    /*
    ..####....####....####...##......######.
    .##......##..##..##..##..##......##.....
    ..####...##......######..##......####...
    .....##..##..##..##..##..##......##.....
    ..####....####...##..##..######..######.
    */
    'Scale': {
        triggers: {
            command: { entries: 'scale' }
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
                entries: ['getword'],
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
            tts: { function: ETTSFunction.SetDictionaryEntry },
            speech: {
                entries: '%lastDictionaryWord was cleared from the dictionary',
                skipDictionary: true
            }
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
            command: { entries: 'rewardson' }
        }
    },
    'GameRewardsOff': {
        triggers: {
            command: { entries: 'rewardsoff' }
        }
    },
    'RefundRedemption': {
        triggers: {
            command: {
                entries: 'refund',
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
                permissions: { moderators: false },
                globalCooldown: 20
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
            command: { entries: 'raid' }
        }
    },
    'Unraid': {
        triggers: {
            command: { entries: 'unraid' }
        }
    },
    'RemoteOn': {
        triggers: {
            command: { entries: 'remoteon' }
        }
    },
    'RemoteOff': {
        triggers: {
            command: { entries: 'remoteoff' }
        }
    },

    /*
    .#####...##..##..#####...##......######...####..
    .##..##..##..##..##..##..##........##....##..##.
    .#####...##..##..#####...##........##....##.....
    .##......##..##..##..##..##........##....##..##.
    .##.......####...#####...######..######...####..
    */
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
                permissions: { everyone: true }
            }
        },
        actionsEntries: {
            chat: { entries: 'Just to let you know, %userTag will be lurking! %userInput' }
        }
    },
    'Label': { // Writes a label to the disk that can be used as a source
        triggers: {
            command: { entries: ['label', 'txt'] }
        },
        actionsEntries: {
            speech: { entries: 'Label set to "%userInput"' },
            label: {
                fileName: 'your_label_in_settings.txt',
                text: '%userInput'
            }
        }
    },
    'Todo': { // Puts a post in Discord using the Discord webhook with the same key
        triggers: {
            command: { entries: 'todo' }
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