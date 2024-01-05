# desbot
## OBS: Important for existing users
### How to upgrade if you want to retain previously stored data
Simplified steps: 
* v5 -> [v6.607][v6db] -> [v6.657][v6migrate] -> [v7.0.0][v7] -> [v7.3.0][v7lite] 

Detailed procedures for specific upgrade steps:
* If you are upgrading a legacy widget with the file based settings/config (v5 or lower), meaning no MySQL database is used yet, you need to upgrade to the last version that has the legacy data imports: [v6.657][v6migrate]
* If you are on a version already using the MySQL database but below [v6.607][v6db] you need to upgrade to that first. When you then do the next upgrade, before using the editor, change: `./_data/version.json` to contain: `{"current":3}` as the migration numbering has changed. 
* If you are on MySQL and want to upgrade to anything above v7, you should first upgrade to [v7.0.0][v7] and run the editor for the last MySQL migrations, then upgrade to [v7.3.0][v7lite] for the SQLite database conversion.

## What is it?
This is currently a browser-based widget that was made to help with streaming SteamVR games on Twitch, as an affiliate, using OBS Studio and a range of accessories. It can be used for non-VR games and for non-affiliates as well though, with some limitations. 

It runs as a browser source inside OBS Studio, so it's already running when you are about to stream.

The project has gone from a very bespoke solution, to a highly flexible one, so it can be used by a variety of users. It is now mostly powered by config files, that define what will happen and when.

## What can it do?
It's honestly so capable now it's almost ridiculous to write it all down, this is an attempt at a high level summary.

1. Create, manage and listen for Twitch rewards, toggle them on/off depending on a range of conditions, update their settings.
2. Listen to commands from Twitch chat, write to Twitch chat and send whispers.
3. Post messages and embeds in Discord channels via webhooks.
4. Speak text using Google's TTS, read out chat, reward messages, status messages, announcements, support for users to change their own voice. Comes with a lot of support functions like name cleanup, text cleanup, custom nicks, word to audio replacement, a dictionary for word replacement.
5. Connect to a range of accessory tools: to change SteamVR settings, capture SteamVR screenshots, detect running SteamVR games, send overlays into SteamVR, and more.
6. Connect to OBS Studio, to show/hide sources and filters, trigger screenshot capture.
7. Write text labels to disk, as well as a range of settings for various functions.
8. Send key presses to arbitrary applications using PHP to execute an AutoIT v3 component.
9. Can pipe screenhots from both SteamVR and OBS to overlays and/or Discord.
10. Can trigger custom URIs for applications, or load a URL in the background to trigger webhooks.
11. Load and post Steam game info, achievements to Twitch chat, Discord.
12. Update the Twitch category from the currently running Steam game.

## How to set it up?
1. Install [XAMPP][xampp] with PHP 8.1 or higher, make sure to launch it manually and not run it as a service, as we need user privileges.
2. Make sure [git][git] is installed and on the path, verify that you can run `git version` successfully.
3. Have some means of compiling TypeScript, possible with [Node.JS][nodejs] and `tsc`. (`npm install tsc` then run `tsc`)
4. Clone this repository to a folder in `htdocs` of `xampp`, it should automatically create a folder named after the repo.
5. Open the URL to the bot in your browser and go from there, should look something like: `http://localhost/desbot/`

## How to configure it?
1. The first time you run the main page, it will convert existing data if available, else it will just create a new database.
2. Go through the initial setup, which includes signing in with Twitch.
3. In the editor, import default presets and events in the `Defaults` section, this will help you get a very solid base setup.
4. Get an API key from [Google][googletts] and set it in `Config > Speech > Google Api Key`, to get TTS going as that is a very useful feature.
5. Use the `Tools`  section of the editor to perform things like importing existing Twitch rewards, load data for Twitch users, load data for Steam games, connect to a Philips Hue hub, and more.

[v6db]: https://github.com/BOLL7708/desbot/releases/tag/v6.607
[v6migrate]: https://github.com/BOLL7708/desbot/releases/tag/v6.657
[v7]: https://github.com/BOLL7708/desbot/releases/tag/v7.0.0
[v7lite]: https://github.com/BOLL7708/desbot/releases/tag/v7.3.0

[xampp]: https://www.apachefriends.org/download.html
[git]: https://git-scm.com/downloads
[nodejs]: https://nodejs.org/en/download/
[googletts]: https://cloud.google.com/text-to-speech/docs/before-you-begin