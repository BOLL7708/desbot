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
}