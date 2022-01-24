// Data
interface ITwitchHelixUsersResponse {
    data: ITwitchHelixUsersResponseData[]
}
interface ITwitchHelixUsersResponseData {
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

// Requests
interface ITwitchHelixRewardConfig extends ITwitchHelixRewardConfigShared {
    title: string
    cost: number
}
interface ITwitchHelixRewardUpdate extends ITwitchHelixRewardConfigShared{
    title?: string
    cost?: number
}
interface ITwitchHelixRewardConfigShared {
    prompt?: string
    background_color?: string
    is_enabled?: boolean
    is_user_input_required?: boolean
    is_max_per_stream_enabled?: boolean
    /**
     * Needs `is_max_per_stream_enabled` to also be set.
     */
    max_per_stream?: number
    is_max_per_user_per_stream_enabled?: boolean
    /**
     * Needs `is_max_per_user_per_stream_enabled` to also be set.
     */
    max_per_user_per_stream?: number
    is_global_cooldown_enabled?: boolean
    /**
     * Needs `is_global_cooldown_enabled` to also be set.
     */
    global_cooldown_seconds?: number
    is_paused?: boolean
    should_redemptions_skip_request_queue?: boolean
}

// Responses
interface ITwitchHelixRewardResponse {
    data?: ITwitchHelixRewardResponseData[]
    error?: string
    message?: string
    status?: number
}
interface ITwitchHelixRewardResponseData {
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

interface ITwitchHelixClipResponse {
    data: ITwitchHelixClipResponseData[],
    pagination: {
        cursor: string
    }
}
interface ITwitchHelixClipResponseData {
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

interface ITwitchHelixGamesResponse {
    data: ITwitchHelixGamesResponseData[]
    pagination: {
        cursor: string
    }
}

interface ITwitchHelixGamesResponseData {
    box_art_url: string
    id: string
    name: string
}

interface ITwitchHelixCategoriesResponse {
    data: ITwitchHelixCategoriesResponseData[],
    pagination: {
        cursor: string
    }
}

interface ITwitchHelixCategoriesResponseData {
    id: string
    name: string
    box_art_url: string
}

interface ITwitchHelixChannelRequest {
    game_id?: string
    broadcaster_language?: string
    title?: string
    delay?: number
}