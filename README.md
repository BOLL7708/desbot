# desbot [alpha]

## What is it and what does it do?

### The Project
Desbot is a streaming bot for Twitch, it runs as a browser-source in your streaming software, and can connect to various APIs and services, play back media and show on screen graphics.  

### Capabilities
It is so capable now that this is a high level summary. Desbot can...
1. Create, manage and listen for Twitch rewards, toggle them on/off depending on a range of conditions, update their settings.
2. Listen to commands from Twitch chat, write to Twitch chat and act on whispers.
3. Post messages and embeds in Discord channels via webhooks.
4. Speak text using Google TTS, read out chat, reward messages, status messages, announcements, support for users to change their own voice. 
   * Comes with a lot of support functions like name cleanup, text cleanup, custom nicks, word to audio replacement, a dictionary for word replacement.
5. Connect to a range of accessory tools: to change SteamVR settings, capture SteamVR screenshots, detect running SteamVR games, send overlays into SteamVR, and more.
6. Connect to OBS Studio using the 4.x Websocket plugin, to show/hide sources and filters, trigger screenshot capture.
7. Write text labels to disk, as well as a range of settings for various functions.
8. Send key presses to arbitrary applications using PHP to execute an AutoIT v3 component.
9. Can pipe screenhots from both SteamVR and OBS to overlays and/or Discord.
10. Can trigger custom URIs for applications, or load a URL in the background to trigger standard webhooks.
11. Load and post Steam game info & achievements to Twitch chat & Discord.
12. Update the Twitch category from the currently running Steam game automatically.

---

## How to use it?

### Installation
1. Install [XAMPP][xampp] with PHP 8.1 or higher, make sure to launch it manually and not run it as a service, as we need user privileges.
2. Inside `php.ini` in `xampp/php` uncomment this line: `extension=sqlite3` by removing the leading `;` to enable the SQLite3 plugin. Restart Apache.
3. If you want to use the backup script and have easy updates by pulling new release install [git][git] and make sure it's on the `PATH`, you can verify that you have that by running `git version` successfully in the terminal.
4. Download or clone this repository to a folder in `htdocs` of `xampp`, when cloning it should automatically create a folder named after the repo.
5. Have some means of compiling TypeScript, this is possible with some editors but otherwise use [Node.JS][nodejs] and use `tsc` to compile. Install it with `npm install tsc` and then run `tsc` in the root of the project folder.
6. Open the URL to the bot in your browser and go through the setup, see the next section for configuration, the URL should look something like this if you used the defaults: `http://localhost/desbot/`

### Configuration
1. The first time you run the main page, it will convert existing data if available, else it will just create a new database. Click the link at the bottom to go to the editor.
2. Go through the initial setup, which includes signing in with Twitch for both your channel and a bot account, which can be your own account or a specially made account.
3. In the editor, import default presets and events in the `Defaults` section, this will help you get a very solid base setup.
4. Get an API key from [Google][googletts] and set it in `Config > Speech > Google Api Key`, to get TTS going as that is a very useful feature.
5. Use the `Tools` section of the editor to perform things like importing existing Twitch rewards, load data for Twitch users, load data for Steam games, connect to a Philips Hue hub, and more.

---

## Additional tools & links
### Applications
* [XAMPP][xampp] - Used to run the bot locally, as the backend is currently relying on PHP.
* [Git][git] - Used to clone the repository and to check which commit the project is on to name backups.
* [Node.JS][nodejs] - Used to compile TypeScript to JavaScript.
* [Open Broadcaster Software][obs] - Streaming software, used to run the bot as a browser source.
* [AutoIT v3][autoit] - Used to send key presses to arbitrary applications.
* [DB Browser for SQLite][sqlite] - SQLite database browser, useful for inspecting the database.
* [OpenVR2WS][openvr2ws] - Used to connect to SteamVR to leech data from it and remotely change settings.
* [OpenVROverlayPipe][pipe] - Used to launch overlay graphics and notifications in SteamVR.
* [SuperScreenShotterVR][sssvr] - Used to capture screenshots from SteamVR and pipe them to overlays and/or Discord.

### Official Links
* [Website][website] - The official website for the bot, contains a lot of information as well as this very ReadMe.
* [Discord][discord] - The official Discord server for the bot, where you can get support and chat with other users.
* [Reddit][reddit] - The official subreddit for the bot.
* [Bluesky][bluesky] - The official Blueskye page for the bot.
* [Twitter][twitter] - The official Twitter account for the bot.

[v6db]: https://github.com/BOLL7708/desbot/releases/tag/v6.607
[v6migrate]: https://github.com/BOLL7708/desbot/releases/tag/v6.657
[v7]: https://github.com/BOLL7708/desbot/releases/tag/v7.0.0
[v7lite]: https://github.com/BOLL7708/desbot/releases

[xampp]: https://www.apachefriends.org/download.html
[git]: https://git-scm.com/downloads
[nodejs]: https://nodejs.org/en/download
[googletts]: https://cloud.google.com/text-to-speech/docs/before-you-begin

[obs]: https://obsproject.com/download
[sqlite]: https://sqlitebrowser.org/dl
[autoit]: https://www.autoitscript.com/site/autoit/downloads
[openvr2ws]: https://github.com/BOLL7708/OpenVR2WS
[pipe]: https://github.com/BOLL7708/OpenVROverlayPipe
[sssvr]: https://github.com/BOLL7708/SuperScreenShotterVR

[website]: https://desbot.app
[discord]: https://desbot.app/discord
[reddit]: https://desbot.app/reddit
[twitter]: https://desbot.app/twitter
[twitch]: https://desbot.app/twitch
[bluesky]: https://desbot.app/bluesky
[trello]: https://desbot.app/trello
