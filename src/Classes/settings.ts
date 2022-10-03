import {TTwitchRedemptionStatus} from '../interfaces/itwitch_pubsub.js'

export default abstract class SettingBaseObject {
    /**
     * Submit any object to get mapped to this class instance.
     * @param props Optional properties to apply to this instance.
     */
    public __apply(props: Object = {}) {
        const prototype = Object.getPrototypeOf(this)
        for(const [name, prop] of Object.entries(props)) {
            if(
                this.hasOwnProperty(name) // This is true if the `props` is an original instance of the implementing class.
                || prototype.hasOwnProperty(name) // The `__new()` call returns an instance with the original class as prototype, which is why we also check it.
            ) {
                (this as any)[name] = prop // We cast to `any` or else we cannot set a property this way.
            }
        }
        // If we don't fill the instance with the properties of the prototype, the prototype will get future assignments and not the instance.
        const propsKeys = Object.keys(props)
        const prototypePropsKeys = Object.keys(prototype).filter(
            (prop) => { return prototype.hasOwnProperty(prop) && !propsKeys.includes(prop) }
        )
        for(const name of prototypePropsKeys) {
            (this as any)[name] = prototype[name] ?? undefined
        }
    }

    /**
     * Returns a new instance with this class as a prototype, meaning it will be seen as the same class by the system.
     * @param props Optional properties to apply to the new instance, usually a plain object cast to the same class which is why we need to do this.
     */
    public __new<T>(props?: T): T&SettingBaseObject {
        const obj = Object.create(this) as T&SettingBaseObject // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        if(props) obj.__apply(props)
        return obj
    }
}

// Settings
export class SettingUserVoice extends SettingBaseObject {
    languageCode: string = ''
    voiceName: string = ''
    gender: string = ''
}
export class SettingUserName extends SettingBaseObject {
    shortName: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingUserMute extends SettingBaseObject {
    active: boolean = false
    reason: string = ''
}
export class SettingDictionaryEntry extends SettingBaseObject {
    substitute: string = ''
    editorUserId: number = 0
    datetime: string = ''
}
export class SettingTwitchReward extends SettingBaseObject {
    id: string = ''
}
export class SettingChannelTrophyStat extends SettingBaseObject {
    userId: number = 0
    index: number = 0
}
export class SettingTwitchSub extends SettingBaseObject {
    totalMonths: number = 0
    streakMonths: number = 0
}
export class SettingTwitchCheer extends SettingBaseObject {
    totalBits: number = 0
    lastBits: number = 0
}
export class SettingTwitchClip extends SettingBaseObject {}

export class SettingStreamQuote extends SettingBaseObject {
    quoterUserId: number = 0
    quoteeUserId: number = 0
    quote: string = ''
    datetime: string = ''
    game: string = ''
}
export class SettingTwitchRedemption extends SettingBaseObject {
    userId: number = 0
    rewardId: string = ''
    time: string = ''
    status: TTwitchRedemptionStatus = 'UNFULFILLED'
    cost: number = 0
}
export class SettingCounterBase extends SettingBaseObject {
    count: number = 0
}
export class SettingAccumulatingCounter extends SettingCounterBase {}
export class SettingIncrementingCounter extends SettingCounterBase {}

export class SettingTwitchClient extends SettingBaseObject {
    clientId: string = ''
    clientSecret: string = ''
    redirectUri: string = ''
}
export class SettingTwitchTokens extends SettingBaseObject {
    userLogin: string = ''
    userId: number = 0
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''
}
export class SettingImportStatus extends SettingBaseObject {
    done: boolean = false
}
export class SettingSteamAchievements extends SettingBaseObject {
    achieved: string[] = []
}