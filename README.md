# Streaming Widget
A browser-based widget for streaming: mainly SteamVR games, to Twitch, using OBS Studio.

This is continiously being worked on as my own streaming solution, but I have done my best to also make it usable by others.  
Keep in mind that it is still very much adapted to my own streaming setup, but hopefully the things I find useful are also useful to you.

This Readme is a work in progress, but somewhat serviceable. Please post an [issue](issues) if you need clarifications, and I'll update this document.

To see the widget in action, join me for a stream over at my [Twitch Channel][twitch] to collect some channel points and try the rewards out. They're cheap!

Other streamers that are using or have used this widget are:
* [c0ld vengeance][c0ldtwitch]
* [DrOculusVR][doctwitch]
* [The VR Realm][paultwitch]
* [WoBoLoKo][wobotwitch]

# What can it do?
1. Text to speech of chat, controlled through commands and rewards, announce anything a bot says or every chat message. It is using [GCP TTS][gcptts] with [Wavenet voices][wavenet] and has a range of chat and username cleanup options.
2. OBS remote control, show/hide sources and/or filters in [OBS Studio][obs].
3. Display SteamVR notifications though [OpenVRNotificationPipe][pipe]
4. Ability to trigger SteamVR screenshots via [SuperScreenShotterVR][sssvr]
5. Ability to change SteamVR settings via [OpenVR2WS][openvr2ws]
6. Logging of chat or screenshots from SSSVR (with embeds!) to Discord.
7. Listen to any rewards from Twitch PubSub and any chat message through Twitch Chat.
8. Trigger console commands in games via [AutoIt][autoit]
9. Register and manage rewards on Twitch, toggle on game switch, use game profiles etc.

# Environment Setup

## PHP
Parts of the widget needs PHP as to write files to disk, you can easily get this by:
1. Install [XAMPP][xampp]. 
2. Run the `XAMPP Control Panel` as administrator and register Apache to run as a service by checking the checkbox on the left side, meaning it will be running at all times. If you don't do this you will have to launch it manually when you want to use the widget.
3. Locate the `/xampp/htdocs/` as that is where we will put the widget files.

## Get the code
Download or clone this repository into a new folder in your web root, mentioned in the PHP section. This folder is what we will work in when setting up the IDE below.

In the end you should have something that looks like `/htdocs/streaming_widget/[all the files]`

## IDE
This is necessary to generate that actual files that will run, TypeScript gets transpiled down to JavaScript. The config is also using TypeScripe interfaces so having this setup is sensible if you want to do frequent changes.
1. Install the Node Package Manager (NPM) through the [Node.JS package][nodejs].
2. Use NPM to install [TypeScript][typescript], run this to install it globally: `npm install -g typescript`
3. Install [Visual Studio Code][vsc].
4. Launch Code and run `File > Open Folder...` and locate the root of the widget folder, something you set up in the previous section.
5. Ctrl+SHIFT+P and run  `Tasks: Manage Automatic Tasks in Folder` and choose `Allow Automatic Tasks` in folder and restart VS Code.
6. Launch `Windows PowerShell` as administrator and execute `Set-ExecutionPolicy RemoteSigned` to allow Visual Studio Code to execute the TypeScript Compiler on launch.

Now any time you launch `Code` in this folder it should automatically run the `TypeScript Compiler` in watch mode, meaning it will build your files every time a change is applied, including editing the config.

# Widget Setup
The widget comes with a prepped config, based on what I run myself on my stream. It has a bunch of predefined keys for various rewards you can use or not. These are the steps you need to perform to set it up:
1. Go to the root folder of the widget.
    1. Open `PowerShell`
    2. Execute `cd 'X:\ThePathToYour\streaming_widget'` with the actual path filled in.
    3. Execute `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` to temporarily allow execution of downloaded scripts, it will only work in the shell you run it in and reset when closed.
    4. Execute `.\_first_run.ps1`, it should create needed folders with associated files.

2. Fill in values in the files listed below, some are API keys and IDs you will need to acquire, see details about that in the next sections.
    1. `_configs/config.php`
    2. `src/_configs/config.ts`
    3. `src/_data/!keys.ts`

## Google Cloud Platform Text-to-Speech (WIP docs)
1. Register for Google Cloud Platform, needs a billing account.
2. Enable the Cloud Text to Speech API
3. IAM & Admin: Add a Service Account
4. APIs & Services: Create an API key for the Cloud Text to Speech API

## Steam Web API
This is used to check which game you are playing on Steam, and to retrieve your Steam achievements.
* Get a key here: https://steamcommunity.com/dev/apikey

## OBS Studio
1. It is presumed you are running [OBS Studio](obs) to manage your stream, it's optional though and most things in the widget will still work, only the remote control of OBS will not.
2. Install the [OBS-Websocket](obswebsockets) plugin for OBS Studio.
3. Open the settings for the plugin in the OBS application: `Tools > WebSockets Server Settings` 
4. Check `Enable WebSockets Server` and `Enable authentication` if needed.
5. Supply a password which you also copy into the config for this widget.

## Twitch Integrations
Download the [Twitch Authenticator][twitchauth], and use these scopes when configuring it:
```
"scope": [
  "bits:read",
  "chat:read",
  "chat:edit",
  "whispers:read",
  "whispers:edit",
  "channel:read:redemptions",
  "channel:read:subscriptions",
  "channel:manage:redemptions",
  "channel:manage:broadcast",
  "channel:manage:raids"
]
```
Get the refresh token from the return, and if you want a separate bot to write in chat, do this twice, once for the channel owner and once for the chat bot. Insert the tokens in the credentials part of the config that resides here: `src/_configs/config.ts`

As a side note, the tokens in the config will not get updated, they are used for initially getting new tokens that are written to `_settings/twitch_tokens.csv`, and those are the ones that will be used in the future.

That's it, the Widget will refresh the tokens every time you run it to allow for as long downtime as possible between sessions.  
**Observe**: If you run the widget for longer than 24 hours, the access token might have expired, which means you should reload the widget for things to work.

### Twitch Reward IDs
Set up rewards on your Twitch page, execute them and the ID will pop up in the JavaScript console for the widget as they are unhandled until you put their ID in the config.

To get a console for the widget while it is running in OBS:
1. Create a shortcut on your desktop or edit one you already have, and add this in Target after the path, make sure to include a space before the first character: ` --remote-debugging-port=9222`
2. Launch [localhost:9222][obsdebug] in your browser and pick `Streaming Widget`.
3. Activate the JavaScript/Development Console in your browser of choice.

[issues]: https://github.com/BOLL7708/streaming_widget/issues
[twitch]: https://twitch.tv/boll7708

[c0ldtwitch]: https://www.twitch.tv/c0ldvengeance
[doctwitch]: https://www.twitch.tv/droculusvr
[paultwitch]: https://www.twitch.tv/thevrrealm
[wobotwitch]: https://www.twitch.tv/woboloko

[gcptts]: https://cloud.google.com/text-to-speech
[wavenet]: https://cloud.google.com/text-to-speech/docs/voices

[powershell]: https://github.com/PowerShell/PowerShell/releases/latest
[xampp]: https://www.apachefriends.org/index.html
[vsc]: https://code.visualstudio.com
[typescript]: https://www.typescriptlang.org/download/
[nodejs]: https://nodejs.org

[obs]: https://obsproject.com
[obswebsockets]: https://obsproject.com/forum/resourcesobs-websocket-remote-control-obs-studio-from-websockets.466
[obsdebug]: http://localhost:9222

[pipe]: https://github.com/BOLL7708/OpenVRNotificationPipe
[sssvr]: https://github.com/BOLL7708/SuperScreenShotterVR
[openvr2ws]: https://github.com/BOLL7708/OpenVR2WS

[autoit]: https://www.autoitscript.com
[twitchauth]: https://github.com/jeppevinkel/twitch-oauth