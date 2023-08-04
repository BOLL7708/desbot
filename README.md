# desbot
<!--
## Links
* Check out the [user wiki][wiki] to see how to set this up.
* Check out the [dev wiki][dev] if you want to contribute to the project.
* Please post [issues][issues] if you bump into any kind of problem.
-->
## OBS: Important for Existing Users
1. If you are upgrading a legacy widget with file based settings (v5 or lower), meaning no database is used yet, you need to upgrade to the [last version that has legacy imports](https://github.com/BOLL7708/streaming_widget/releases/tag/v6.657) if you want your data converted.
2. If you are on a version below [v6.657](https://github.com/BOLL7708/streaming_widget/releases/tag/v6.657), you need to first upgrade to [v6.607](https://github.com/BOLL7708/streaming_widget/releases/tag/v6.607) and run the setup in the editor to apply the database migrations. When you do the next upgrade, before using the editor, change: `./_data/version.json` to contain: `{"current":3}`.

## What is it?
This is a browser-based widget that was made to help with streaming SteamVR games on Twitch, as an affiliate, using OBS Studio and a range of accessories. It can be used for non-VR games and for non-affiliates as well though, with some limitations. 

It runs as a browser source inside OBS Studio, so it's already running when you are about to stream.

The project has gone from a very bespoke solution, to a highly flexible one, so it can be used by a variety of users. It is now mostly powered by config files, that define what will happen and when.

## What can it do?
It's honestly so capable now it's almost ridiculous to write it all down, this is an attempt at a high level summary.

1. Create, manage and listen for Twitch rewards, toggle them on/off depending on a range of conditions, update their settings.
2. Listen to commands from Twitch chat, write to Twitch chat and send whispers.
3. Post messages and embeds in Discord channels via webhooks.
4. Speak text using Google's Wavenet TTS, read out chat, reward messages, status messages, announcements, support for users to change their own voice. Comes with a lot of support functions like name cleanup, text cleanup, custom nicks, word to audio replacement, a dictionary for word replacement.
5. Connect to a range of accessory tools: to change SteamVR settings, capture SteamVR screenshots, detect running SteamVR games, send overlays into SteamVR, and more.
6. Connect to OBS Studio, to show/hide sources and filters, trigger screenshot capture.
7. Write text labels to disk, as well as a range of settings for various functions.
8. Send key presses to arbitrary applications using PHP to execute an AutoIT v3 component.
9. Can pipe screenhots from both SteamVR and OBS to overlays and/or Discord.
10. Can trigger custom URIs for applications, or load a URL in the background to trigger webhooks.
11. Load and post Steam game info, achievements to Twitch chat, Discord.
12. Update the Twitch category from the currently running Steam game.

## How to set it up?
1. Install [XAMPP](https://www.apachefriends.org/download.html) with PHP 8.1 or higher, make sure to launch it manually and not run it as a service, as we need user privileges.
2. Make sure GIT is installed and on the path.
3. Have some means of compiling TypeScript.
4. Clone the repo to a folder in `htdocs` of `xampp`.
5. Run the `_first_run.sh` script.
6. Open the URL to the widget in your browser and go from there.
7. Then editing the configs is not covered here, but it will change soon enough to be part of the web experience.

## Who are using it?

* [BOLL][twitch] - The original author of this project!
* [c0ld vengeance][c0ldtwitch]
* [Dr Oculus VR][doctwitch]
* [WoBo][wobotwitch]
* [badpixel134][pixeltwitch]
* [JeppeVinkel][jeppetwitch]

[wiki]: https://github.com/BOLL7708/streaming_widget_wiki/wiki
[dev]: https://github.com/BOLL7708/streaming_widget/wiki
[issues]: https://github.com/BOLL7708/streaming_widget/issues

[twitch]: https://twitch.tv/boll7708
[c0ldtwitch]: https://www.twitch.tv/c0ldvengeance
[doctwitch]: https://www.twitch.tv/droculusvr
[wobotwitch]: https://www.twitch.tv/woboloko
[pixeltwitch]: https://www.twitch.tv/badpixel134
[jeppetwitch]: https://www.twitch.tv/jeppevinkel
