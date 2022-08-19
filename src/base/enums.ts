enum ETTSType {
    Said, // [name] said: [text]
    Action, // [name] [text]
    Announcement, // [text]
    Cheer // [name] cheered: [text]
}
enum ETTSFunction {
    Enable,
    Disable,
    StopCurrent,
    StopAll,
    SetUserEnabled,
    SetUserDisabled,
    SetUserNick,
    GetUserNick,
    ClearUserNick,
    SetUserVoice,
    SetUserGender,
    SetDictionaryEntry,
    GetDictionaryEntry
}
enum EEventSource {
    Created,
    Updated,
    TwitchReward,
    TwitchCheer,
    TwitchSubscription,
    TwitchChat,
    TwitchCommand,
    TwitchRemoteCommand,
    AutoCommand,
    Timer,
    Relay
}