class MainController {
    _twitchPubsub: TwitchPubsub = new TwitchPubsub();
    init(): void {
        this._twitchPubsub.registerOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_ROOMPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_ROOMPEEK)
        );
        this._twitchPubsub.registerOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_HEADPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_HEADPEEK)
        );
        this._twitchPubsub.registerTTSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAK),
            Config.KEY_TTSSPEAK
        );
        this._twitchPubsub.init();
    }   
}