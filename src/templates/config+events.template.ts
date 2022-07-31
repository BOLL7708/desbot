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
                permissions: {
                    everyone: true
                }
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
        actions: {
            tts: {
                function: ETTSFunction.SetUserVoice
            },
            speech: {
                entries: '%targetOrUserTag now sounds like this.',
                voiceOfUser: '%targetOrUserLogin'
            },
            chat: 'TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice'
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
            command: {}
        },
        actions: {
            speech: { entries: 'Global TTS is now enabled.' },
            tts: { function: ETTSFunction.Enable },
            rewardStates: { [Keys.REWARD_TTSSPEAK]: true }
        }
    },
    [KeysTemplate.COMMAND_TTS_OFF]: {
        triggers: {
            command: {}
        },
        actions: {
            speech: { entries: 'Global TTS is now disabled.' },
            tts: { function: ETTSFunction.Disable },
            rewardStates: { [Keys.REWARD_TTSSPEAK]: false }
        }
    },
    [KeysTemplate.COMMAND_TTS_SILENCE]: {
        triggers: {
            command: {}
        },
        actions: {
            tts: { function: ETTSFunction.StopCurrent }
        }
    },
    [KeysTemplate.COMMAND_TTS_DIE]: {
        triggers: {
            command: {}
        },
        actions: {
            tts: { function: ETTSFunction.StopAll }
        }
    },
    [KeysTemplate.COMMAND_TTS_NICK]: {
        triggers: {
            command: {
                permissions: {
                    VIPs: true,
                    subscribers: true
                },
                requireMinimumWordCount: 1
            }
        },
        actions: {
            tts: { function: ETTSFunction.SetUserNick },
            speech: { entries: '%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute' }
        }
    },
    [KeysTemplate.COMMAND_TTS_GETNICK]: {
        triggers: {
            command: {
                permissions: {
                    everyone: true
                }
            }
        },
        actions: {
            tts: { function: ETTSFunction.GetUserNick },
            chat: 'TTS: "%lastTTSSetNickLogin" is called "%lastTTSSetNickSubstitute"'
        }
    },
    [KeysTemplate.COMMAND_TTS_CLEARNICK]: {
        triggers: {
            command: {
                permissions: {
                    VIPs: true,
                    subscribers: true
                }
            }
        },
        actions: {
            tts: { function: ETTSFunction.ClearUserNick },
            speech: { entries: '%lastTTSSetNickLogin is now called %lastTTSSetNickSubstitute' }
        }
    },
    [KeysTemplate.COMMAND_TTS_MUTE]: {
        triggers: {
            command: {}
        },
        actions: {
            tts: { function: ETTSFunction.SetUserDisabled },
            speech: { entries: '%targetTag has lost their voice.' }
        }
    },
    [KeysTemplate.COMMAND_TTS_UNMUTE]: {
        triggers: {
            command: {}
        },
        actions: {
            tts: { function: ETTSFunction.SetUserEnabled },
            speech: { entries: '%targetTag has regained their voice.' }
        }
    },
    [KeysTemplate.COMMAND_TTS_GETVOICE]: {
        triggers: {
            command: {
                permissions: {
                    everyone: true
                }
            }
        },
        actions: {
            chat: 'TTS: %targetOrUserTag\'s voice is "%targetOrUserVoice"'
        }
    },
    [KeysTemplate.COMMAND_TTS_GENDER]: {
        triggers: {
            command: {
                permissions: {
                    VIPs: true,
                    subscribers: true
                }
            }
        },
        actions: {
            tts: { function: ETTSFunction.SetUserGender },
            speech: {
                entries: '%targetOrUserTag now sounds like this',
                voiceOfUser: '%targetOrUserLogin'
            },
            chat: 'TTS: %targetOrUserTag got their voice set to: %targetOrUserVoice'
        }
    },
    [KeysTemplate.COMMAND_TTS_VOICES]: {
        triggers: {
            command: {
                permissions: {
                    everyone: true
                },
                cooldown: 60 * 5
            }
        },
        actions: {
            chat: 'Preview Google TTS voices here, pick a Wavenet (mandatory) voice and use the name with the "Set Your Voice" reward: https://cloud.google.com/text-to-speech/docs/voices'
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
                permissions: {
                    VIPs: true
                }
            }
        }
    },
    [KeysTemplate.COMMAND_CHAT_ON]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_CHAT_OFF]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_PING_ON]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_PING_OFF]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_QUOTE]: {
        triggers: {
            command: {}
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
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_LOG_OFF]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
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
            command: {}
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
                requireMinimumWordCount: 2
            }
        },
        actions: {
            tts: {
                function: ETTSFunction.SetDictionaryEntry
            },
            speech: {
                entries: '%lastDictionaryWord is now said as %lastDictionarySubstitute',
                skipDictionary: true
            }
        }
    },
    [KeysTemplate.COMMAND_DICTIONARY_GET]: {
        triggers: {
            command: {
                permissions: {
                    everyone: true
                }
            }
        },
        actions: {
            tts: {
                function: ETTSFunction.GetDictionaryEntry
            },
            chat: 'Dictionary: "%lastDictionaryWord" is said as "%lastDictionarySubstitute"'
        }
    },
    [KeysTemplate.COMMAND_DICTIONARY_CLEAR]: {
        triggers: {
            command: {
                requireExactWordCount: 1
            }
        },
        actions: {
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
    .#####...######..##...##...####...#####...#####....####..
    .##..##..##......##...##..##..##..##..##..##..##..##.....
    .#####...####....##.#.##..######..#####...##..##...####..
    .##..##..##......#######..##..##..##..##..##..##......##.
    .##..##..######...##.##...##..##..##..##..#####....####..
    */
    [KeysTemplate.COMMAND_UPDATEREWARDS]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_GAMEREWARDS_ON]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_REFUND_REDEMPTION]: {
        triggers: {
            command: {
                cooldown: 30
            }
        }
    },
    [KeysTemplate.COMMAND_CLEAR_REDEMPTIONS]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                },
                cooldown: 60
            }
        }
    },
    [KeysTemplate.COMMAND_RESET_INCREWARD]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                },
                cooldown: 20
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
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_CLIPS]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_GAMERESET]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_RAID]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_UNRAID]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_REMOTE_ON]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_REMOTE_OFF]: {
        triggers: {
            command: {}
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
                permissions: {
                    everyone: true
                },
                cooldown: 3*60
            }
        },
        actions: {
            sign: {
                title: 'Current Game',
                image: '%gameBanner',
                subtitle: '%gameName\n%gamePrice',
                durationMs: 10000
            },
            chat: 'Game: %gameName - Released: %gameRelease - Price: %gamePrice - Link: %gameLink'
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
            command: {}
        },
        actions: {
            speech: {
                entries: '%userInput'
            }
        }
    },
    [KeysTemplate.COMMAND_LABEL]: { // Writes a label to the disk that can be used as a source
        triggers: {
            command: {}
        },
        actions: {
            speech: {
                entries: 'Label set to "%userInput"'
            },
            label: {
                fileName: 'your_label_in_settings.txt',
                text: '%userInput'
            }
        }
    },
    [KeysTemplate.COMMAND_TODO]: { // Puts a post in Discord using the Discord webhook with the same key
        triggers: {
            command: {}
        },
        actions: {
            speech: {
                entries: 'To do list appended with: %userInput'
            },
            discord: '-> %userInput'
        }
    },
    [KeysTemplate.COMMAND_END_STREAM]: { // Runs multiple commands suitable for when ending a stream
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        },
        actions: {
            speech: {
                entries: 'Running stream end tasks'
            },
            commands: { 
                entries: [
                    KeysTemplate.COMMAND_CHANNELTROPHY_STATS,
                    KeysTemplate.COMMAND_CLIPS,
                    KeysTemplate.COMMAND_CLEAR_REDEMPTIONS,
                    KeysTemplate.COMMAND_RESET_INCREWARD
                ],
                interval: 20
            }
        }
    },
    [KeysTemplate.COMMAND_SHOUTOUT]: { // Used to promote another user
        triggers: {
            command: {
                cooldown: 30,
                requireUserTag: true
            }
        },
        actions: {
            chat: 'Say hello to %targetTag who last streamed "%targetGame", considering following! (their channel: %targetLink)'
        }
    },
    [KeysTemplate.COMMAND_LURK]: { // Used to announce that a user is lurking
        triggers: {
            command: {
                permissions: {
                    everyone: true
                }
            }
        },
        actions: {
            chat: 'Just to let you know, %userTag will be lurking! %userInput'
        }
    },
    [KeysTemplate.COMMAND_WIDGET]: {
        triggers: {
            command: {
                permissions: {
                    everyone: true
                },
                cooldown: 60 * 5
            }
        },
        actions: {
            chat: 'Streaming Widget Repository -> https://github.com/BOLL7708/streaming_widget'
        }
    },
    [KeysTemplate.COMMAND_WIKI]: { // A link to the user wiki for the widget
        triggers: {
            command: {
                permissions: {
                    everyone: true
                },
                cooldown: 60 * 5
            }
        },
        actions: {
            chat: 'Streaming Widget Wiki -> https://github.com/BOLL7708/streaming_widget_wiki/wiki'
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
        actions: {
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
        actions: {
            audio: {
                src: '_assets/random_audio.wav',
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