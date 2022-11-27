// Data
export interface ITwitchHelixUsersResponse {
    data: ITwitchHelixUsersResponseData[]
}
export interface ITwitchHelixUsersResponseData {
    id: string
    login: string
    display_name: string
    type: string
    broadcaster_type: string
    description: string
    profile_image_url: string
    offline_image_url: string
    view_count: number
    email: string
    created_at: string
}

export interface ITwitchHelixChannelResponse {
    data: ITwitchHelixChannelResponseData[]
}
export interface ITwitchHelixChannelResponseData {
    broadcaster_id: string
    broadcaster_login: string
    broadcaster_name: string
    broadcaster_language: string
    game_id: string
    game_name: string
    title: string
    delay: number
}

// Requests
export interface ITwitchHelixRewardConfig extends ITwitchHelixRewardConfigShared {
    title: string
    cost: number
}
export interface ITwitchHelixRewardUpdate extends ITwitchHelixRewardConfigShared{
    title?: string
    cost?: number
}
export interface ITwitchHelixRewardConfigShared {
    prompt?: string
    background_color?: string
    is_enabled?: boolean
    is_user_input_required?: boolean
    /**
     * Note: Also needs `max_per_stream` to be set or the update will fail.
     */
    is_max_per_stream_enabled?: boolean
    /**
     * Note: Also needs `is_max_per_stream_enabled` to be set or the update will fail.
     */
    max_per_stream?: number
    /**
     * Note: Also needs `max_per_user_per_stream` to be set or the update will fail.
     */
    is_max_per_user_per_stream_enabled?: boolean
    /**
     * Note: Also needs `is_max_per_user_per_stream_enabled` to be set or the update will fail.
     */
    max_per_user_per_stream?: number
    /**
     * Note: Also needs `global_cooldown_seconds` to be set or the update will fail.
     */
    is_global_cooldown_enabled?: boolean
    /**
     * Note: Also needs `is_global_cooldown_enabled` to be set or the update will fail.
     */
    global_cooldown_seconds?: number
    is_paused?: boolean
    should_redemptions_skip_request_queue?: boolean
}

// Responses
export interface ITwitchHelixRewardResponse {
    data?: ITwitchHelixRewardResponseData[]
    error?: string
    message?: string
    status?: number
}
export interface ITwitchHelixRewardResponseData {
    broadcaster_name: string
    broadcaster_login: string
    broadcaster_id: string
    id: string
    image: {
        url_1x: string
        url_2x: string
        url_4x: string
    }
    background_color: string
    is_enabled: boolean
    cost: number,
    title: string,
    prompt: string,
    is_user_input_required: boolean,
    max_per_stream_setting: {
        is_enabled: boolean
        max_per_stream: number
    }
    max_per_user_per_stream_setting: {
        is_enabled: boolean
        max_per_user_per_stream: number
    }
    global_cooldown_setting: {
        is_enabled: boolean
        global_cooldown_seconds: number
    }
    is_paused: boolean
    is_in_stock: boolean
    default_image: {
        url_1x: string
        url_2x: string
        url_4x: string
    }
    should_redemptions_skip_request_queue: boolean
    redemptions_redeemed_current_stream: any // Not specified in docs
    cooldown_expires_at: any // Not specified in docs
}

export interface ITwitchHelixClipResponse {
    data: ITwitchHelixClipResponseData[],
    pagination: {
        cursor: string
    }
}
export interface ITwitchHelixClipResponseData {
    id: string
    url: string
    embed_url: string
    broadcaster_id: string
    broadcaster_name: string
    creator_id: string
    creator_name: string
    video_id: string
    game_id: string
    language: string
    title: string
    view_count: number
    created_at: string
    thumbnail_url: string
    duration: number
}

export interface ITwitchHelixGamesResponse {
    data: ITwitchHelixGamesResponseData[]
    pagination: {
        cursor: string
    }
}

export interface ITwitchHelixGamesResponseData {
    box_art_url: string
    id: string
    name: string
}

export interface ITwitchHelixCategoriesResponse {
    data: ITwitchHelixCategoriesResponseData[],
    pagination: {
        cursor: string
    }
}

export interface ITwitchHelixCategoriesResponseData {
    id: string
    name: string
    box_art_url: string
}

export interface ITwitchHelixChannelRequest {
    game_id?: string
    broadcaster_language?: string
    title?: string
    delay?: number
}

export interface ITwitchHelixChatColorResponse {
    data: [
        {
            user_id: string,
            user_name: string,
            user_login: string,
            color: string
        }
    ]
}

export interface ITwitchHelixRewardStates {
    [key: string]: boolean
}

export interface ITwitchHelixRoleResponse {
    data: ITwitchHelixRoleResponseData[],
    pagination: {
        cursor: string
    }
}
export interface ITwitchHelixRoleResponseData {
    user_id: string,
    user_login: string,
    user_name: string
}