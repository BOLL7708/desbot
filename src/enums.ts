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
    SetUserVoice,
    SetUserGender,
    SetDictionaryEntry,
    GetDictionaryEntry
}
enum EEventSource {
    TwitchReward,
    TwitchCheer,
    TwitchChat,
    TwitchCommand,
    TwitchRemoteCommand,
    AutoCommand,
    Timer
}