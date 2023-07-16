/**
 * A separate config for things that are best to keep private.
 *
 * This can with benefit be broken out to a separate file if you want to edit your widget live on stream.
 *
 * See {@link Config} for more info about splitting up the config file.
 */
export interface ICredentialsConfig {
    /**
     * Webhooks from Discord to which we pipe various things.
     */
    DiscordWebhooks: Partial<Record<string, string>>
}