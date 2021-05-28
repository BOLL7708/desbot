class Labels {
    updateOrAddLabel(label: ILabel) {
        Settings.pushSetting(Settings.LABELS, 'key', label)
    }
}