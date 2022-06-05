Config.events = {...Config.events,
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
                title: '💬 Speak Once',
                cost: 5,
                prompt: 'Your message is read aloud.',
                background_color: '#AAAAAA',
                is_user_input_required: true,
                should_redemptions_skip_request_queue: true
            }
        }
    },
    [KeysTemplate.REWARD_TTSSETVOICE]: {
        triggers: {
            reward: {
                title: '👄 Set Your Voice',
                cost: 5,
                prompt: 'Change your speaking voice, see the About section for options.',
                background_color: '#AAAAAA',
                is_user_input_required: true,
                should_redemptions_skip_request_queue: true
            }
        }
    },
    [KeysTemplate.REWARD_TTSSWITCHVOICEGENDER]: {
        triggers: {
            reward: {
                title: 'TTS Gender Flip',
                cost: 10,
                prompt: "Switch your TTS voice gender",
                background_color: '#808080'
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
            ignoreUpdateCommand: true
        },
        triggers: {
            reward: {
                title: '🏆 Held by nobody!',
                cost: 1,
                prompt: 'Become the Channel Trophy holder! You hold 🏆 until someone else pays the ever increasing (+1) price!',
                background_color: '#000000',
                is_max_per_stream_enabled: true,
                max_per_stream: 10000,
                is_global_cooldown_enabled: true,
                global_cooldown_seconds: 15
            }
        },
        actions: {
            audio: {
                src: '_assets/Lyd_SFX_535_Cup_10.wav',
                volume: 0.75
            },
            sign: {
                durationMs: 10000, 
                title: 'The 🏆 was grabbed!',
                subtitle: '%userName',
            }
        }
    }
}