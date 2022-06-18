/*
..######...#######..##.....##.##.....##....###....##....##.########...######.
.##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
.##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
.##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
.##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
.##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
    */
Config.events = {...Config.events,
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
        }
    },
    [KeysTemplate.COMMAND_TTS_OFF]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_TTS_SILENCE]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_TTS_DIE]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_TTS_NICK]: {
        triggers: {
            command: {
                permissions: {
                    VIPs: true,
                    subscribers: true
                }
            }
        }
    },
    [KeysTemplate.COMMAND_TTS_MUTE]: {
        triggers: {
            command: {}
        }
    },
    [KeysTemplate.COMMAND_TTS_UNMUTE]: {
        triggers: {
            command: {}
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
    ..####...######..######...####...##...##..##..##..#####..
    .##........##....##......##..##..###.###..##..##..##..##.
    ..####.....##....####....######..##.#.##..##..##..#####..
    .....##....##....##......##..##..##...##...####...##..##.
    ..####.....##....######..##..##..##...##....##....##..##.
    */
    [KeysTemplate.COMMAND_BRIGHTNESS]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_REFRESHRATE]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },
    [KeysTemplate.COMMAND_VRVIEWEYE]: {
        triggers: {
            command: {
                permissions: {
                    moderators: false
                }
            }
        }
    },

    /*
    .#####...######...####...######..######...####...##..##...####...#####...##..##.
    .##..##....##....##..##....##......##....##..##..###.##..##..##..##..##...####..
    .##..##....##....##........##......##....##..##..##.###..######..#####.....##...
    .##..##....##....##..##....##......##....##..##..##..##..##..##..##..##....##...
    .#####...######...####.....##....######...####...##..##..##..##..##..##....##...
    */
    [KeysTemplate.COMMAND_DICTIONARY]: {
        triggers: {
            command: {}
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
            label: "your_label_in_settings.txt"
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
            discord: '👉 %userInput'
        }
    },
    [KeysTemplate.COMMAND_END_STREAM]: {
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
    }
}