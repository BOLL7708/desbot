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
    [KeysTemplate.EVENT_TTSSETVOICE]: {
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
    [KeysTemplate.COMMAND_TTS_ON]: {
        triggers: {
            command: { entries: 'ttson' }
        },
        actionsEntries: {
            speech: { entries: 'Global TTS is now enabled.' },
            tts: { function: ETTSFunction.Enable },
            rewardStates: { [Keys.REWARD_TTSSPEAK]: false }
        }
    },
    [KeysTemplate.COMMAND_TTS_OFF]: {
        triggers: {
            command: { entries: 'ttsoff' }
        },
        actionsEntries: {
            speech: { entries: 'Global TTS is now disabled.' },
            tts: { function: ETTSFunction.Disable },
            rewardStates: { [Keys.REWARD_TTSSPEAK]: true }
        }
    },
    [KeysTemplate.COMMAND_TTS_SILENCE]: {
        triggers: {
            command: { entries: 'silence' }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopCurrent }
        }
    },
    [KeysTemplate.COMMAND_TTS_DIE]: {
        triggers: {
            command: { entries: ['die', 'ttsdie'] }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.StopAll }
        }
    },
    [KeysTemplate.COMMAND_TTS_NICK]: {
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
    [KeysTemplate.COMMAND_TTS_GETNICK]: {
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
    [KeysTemplate.COMMAND_TTS_CLEARNICK]: {
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
    [KeysTemplate.COMMAND_TTS_MUTE]: {
        triggers: {
            command: { entries: 'mute' }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserDisabled },
            speech: { entries: '%targetTag has lost their voice.' }
        }
    },
    [KeysTemplate.COMMAND_TTS_UNMUTE]: {
        triggers: {
            command: { entries: 'unmute' }
        },
        actionsEntries: {
            tts: { function: ETTSFunction.SetUserEnabled },
            speech: { entries: '%targetTag has regained their voice.' }
        }
    },
    [KeysTemplate.COMMAND_TTS_GETVOICE]: {
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
    [KeysTemplate.COMMAND_TTS_GENDER]: {
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
    [KeysTemplate.COMMAND_TTS_VOICES]: {
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
    [KeysTemplate.COMMAND_CHAT]: {
        triggers: {
            command: {
                entries: 'chat',
                permissions: { VIPs: true }
            }
        }
    },
    [KeysTemplate.COMMAND_CHAT_ON]: {
        triggers: {
            command: { entries: 'chaton' }
        }
    },
    [KeysTemplate.COMMAND_CHAT_OFF]: {
        triggers: {
            command: { entries: 'chatoff' }
        }
    },
    [KeysTemplate.COMMAND_PING_ON]: {
        triggers: {
            command: { entries: 'pingon' }
        }
    },
    [KeysTemplate.COMMAND_PING_OFF]: {
        triggers: {
            command: { entries: 'pingoff' }
        }
    },
    [KeysTemplate.COMMAND_QUOTE]: {
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
    [KeysTemplate.COMMAND_LOG_ON]: {
        triggers: {
            command: {
                entries: 'logon',
                permissions: { moderators: false }
            }
        }
    },
    [KeysTemplate.COMMAND_LOG_OFF]: {
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
    [KeysTemplate.COMMAND_SCALE]: {
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
    [KeysTemplate.COMMAND_DICTIONARY_SET]: {
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
    [KeysTemplate.COMMAND_DICTIONARY_GET]: {
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
    [KeysTemplate.COMMAND_DICTIONARY_CLEAR]: {
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
    [KeysTemplate.COMMAND_UPDATEREWARDS]: {
        triggers: {
            command: {
                entries: 'update',
                permissions: { moderators: false }
            }
        }
    },
    [KeysTemplate.COMMAND_GAMEREWARDS_ON]: {
        triggers: {
            command: { entries: 'rewardson' }
        }
    },
    [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: {
        triggers: {
            command: { entries: 'rewardsoff' }
        }
    },
    [KeysTemplate.COMMAND_REFUND_REDEMPTION]: {
        triggers: {
            command: {
                entries: 'refund',
                globalCooldown: 30
            }
        }
    },
    [KeysTemplate.COMMAND_CLEAR_REDEMPTIONS]: {
        triggers: {
            command: {
                entries: 'clearqueue',
                permissions: { moderators: false },
                globalCooldown: 60
            }
        }
    },
    [KeysTemplate.COMMAND_RESET_INCREMENTING_EVENTS]: {
        triggers: {
            command: {
                entries: 'resetinc',
                permissions: { moderators: false },
                globalCooldown: 20
            }
        }
    },
    [KeysTemplate.COMMAND_RESET_ACCUMULATING_EVENTS]: {
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
    [KeysTemplate.COMMAND_RELOADWIDGET]: {
        triggers: {
            command: {
                entries: 'reload',
                permissions: { moderators: false },
                globalCooldown: 20
            }
        }
    },
    [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: {
        triggers: {
            command: {
                entries: 'trophy',
                permissions: { moderators: false }
            }
        }
    },
    [KeysTemplate.COMMAND_CLIPS]: {
        triggers: {
            command: {
                entries: 'clips',
                permissions: { moderators: false }
            }
        }
    },
    [KeysTemplate.COMMAND_GAMERESET]: {
        triggers: {
            command: {
                entries: 'nogame',
                permissions: { moderators: false }
            }
        }
    },
    [KeysTemplate.COMMAND_RAID]: {
        triggers: {
            command: { entries: 'raid' }
        }
    },
    [KeysTemplate.COMMAND_UNRAID]: {
        triggers: {
            command: { entries: 'unraid' }
        }
    },
    [KeysTemplate.COMMAND_REMOTE_ON]: {
        triggers: {
            command: { entries: 'remoteon' }
        }
    },
    [KeysTemplate.COMMAND_REMOTE_OFF]: {
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
    [KeysTemplate.COMMAND_GAME]: {
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
    [KeysTemplate.COMMAND_SAY]: { // Announces something with the TTS
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
    [KeysTemplate.COMMAND_LURK]: { // Used to announce that a user is lurking
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
    [KeysTemplate.COMMAND_LABEL]: { // Writes a label to the disk that can be used as a source
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
    [KeysTemplate.COMMAND_TODO]: { // Puts a post in Discord using the Discord webhook with the same key
        triggers: {
            command: { entries: 'todo' }
        },
        actionsEntries: {
            speech: { entries: 'To do list appended with: %userInput' },
            discord: { entries: '-> %userInput' }
        }
    },
    [KeysTemplate.COMMAND_SHOUTOUT]: { // Used to promote another user
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
    [KeysTemplate.COMMAND_END_STREAM]: { // Runs multiple commands suitable for when ending a stream
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
            commands: { 
                entries: [ 'trophy', 'clips', 'clearqueue', 'resetinc', 'resetacc' ],
                interval: 20
            }
        }
    },
    [KeysTemplate.COMMAND_WIDGET]: {
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
    [KeysTemplate.COMMAND_WIKI]: { // A link to the user wiki for the widget
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
    [KeysTemplate.REWARD_TTSSPEAK]: {
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
    [KeysTemplate.REWARD_CHANNELTROPHY]: {
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