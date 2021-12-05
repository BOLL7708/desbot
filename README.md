# Streaming Widget
A very bespoke browser-based widget for streaming.

This has been worked on as my own streaming solution, but I will try to make it usable by others, keep in mind it is still very much adapted to my own streaming setup, but comes ready with a prepared config template.

Readme is WIP but somewhat serviceable. Please post an issue if you need clarifications.

To see the widget in action, join me for a stream over at my [Twitch Channel](https://twitch.tv/boll7708) to collect some channel points and try the rewards out. They're cheap!

Other streamers that are using or have used this widget are:
* [c0ld vengeance](https://www.twitch.tv/c0ldvengeance)
* [DrOculusVR](https://www.twitch.tv/droculusvr)
* [The VR Realm](https://www.twitch.tv/thevrrealm) (retired)
* [WoBoLoKo](https://www.twitch.tv/woboloko)

# What can it do?
1. Text to speech from rewards, a bot announcer or just every chat message. It's using GCP TTS with Wavenet voices and has a range of text transforms and name cleanup.
2. OBS remote control, show/hide sources and/or filters in OBS Studio.
3. Display SteamVR notifications though [OpenVRNotificationPipe](https://github.com/BOLL7708/OpenVRNotificationPipe)
4. Ability to trigger SteamVR screenshots via [SuperScreenShotterVR](https://github.com/BOLL7708/SuperScreenShotterVR)
5. Ability to change SteamVR settings via [OpenVR2WS](https://github.com/BOLL7708/OpenVR2WS)
6. Logging of chat or screenshots from SSSVR (with embeds!) to Discord.
7. Listen to any rewards from Twitch PubSub and any chat message through Twitch Chat.
8. Trigger console commands in games via [AutoIt](https://www.autoitscript.com/)
9. Register and manage rewards on Twitch, toggle on game switch, use game profiles etc.

# Environment Setup

## PHP
Parts of the widget needs PHP as to write files to disk, you can easily get this by:
1. Install [XAMPP](https://www.apachefriends.org/index.html). 
2. Run the `XAMPP Control Panel` as administrator and register Apache to run as a service by checking the checkbox on the left side, meaning it will be running at all times. If you don't do this you will have to launch it manually when you want to use the widget.
3. Locate the `/xampp/htdocs/` as that is where we will put the widget files.

## Get the code
Download or clone this repository into a new folder in your web root, mentioned in the PHP section. This folder is what we will work in when setting up the IDE below.

In the end you should have something that looks like `/htdocs/streaming_widget/[all the files]`

## IDE
This is necessary to generate that actual files that will run, TypeScript gets transpiled down to JavaScript. The config is also using TypeScripe interfaces so having this setup is sensible if you want to do frequent changes.
1. Install the Node Package Manager (NPM) through the [Node.JS package](https://nodejs.org).
2. Use NPM to install [TypeScript](https://www.typescriptlang.org/download/), run this to install it globally: `npm install -g typescript`
3. Install [Visual Studio Code](https://code.visualstudio.com/).
4. Launch Code and run `File > Open Folder...` and locate the root of the widget folder, something you set up in the previous section.
5. Ctrl+SHIFT+P and run  `Tasks: Manage Automatic Tasks in Folder` and choose `Allow Automatic Tasks` in folder and restart VS Code.
6. Launch `Windows PowerShell` as administrator and run `Set-ExecutionPolicy RemoteSigned` to allow Visual Studio Code to execute the TypeScript Compiler on launch.

Now any time you launch `Code` in this folder it should automatically run the `TypeScript Compiler` in watch mode, meaning it will build your files every time a change is applied, including editing the config.

# Widget Setup
The widget comes with a prepped config, based on what I run myself on my stream. It has a bunch of predefined keys for various rewards you can use or not. These are the steps you need to perform to set it up:
1. Copy or rename `config.template.ts` to `config.ts`
2. In the `config.ts` file, rename the `class` from `ConfigTemplate` to just `Config`.
3. Fill in the missing values in the config, some are API keys and IDs you will need to acquire, see below.

## TTS (WIP docs)
1. Register for Google Cloud Platform, needs a billing accound.
2. Enable the Cloud Text to Speech API
3. IAM & Admin: Add a Service Account
4. APIs & Services: Create an API key for the Cloud Text to Speech API

## OBS Studio
1. It is presumed you are running [OBS Studio](https://obsproject.com/) to manage your stream, it's optional though and most things in the widget will still work, only the remote control of OBS will not.
2. Install the [OBS-Websocket](https://obsproject.com/forum/resources/obs-websocket-remote-control-obs-studio-from-websockets.466/) plugin for OBS Studio.
3. Open the settings for the plugin in the OBS application: `Tools > WebSockets Server Settings` 
4. Check `Enable WebSockets Server` and `Enable authentication` if needed.
5. Supply a password which you also copy into the config for this widget.

## Twitch Integrations
Download the [Twitch Authenticator](https://github.com/jeppevinkel/twitch-oauth), and use these scopes when configuring it:
```
"scope": [
  "bits:read",
  "chat:read",
  "chat:edit",
  "whispers:read",
  "whispers:edit",
  "channel:read:redemptions",
  "channel:read:subscriptions",
  "channel:manage:redemptions"
]
```
Copy or rename the Twitch tokens file `settings_twitch_tokens.csv.template`, found in `/streaming_widget/settings/`, so it does not have `.template` in the name. Put the resulting tokens into the new file.

That's it, the Widget will refresh the tokens every time you run it to allow for as long downtime as possible between sessions.

### Twitch Reward IDs
Set up rewards on your Twitch page, execute them and the ID will pop up in the JavaScript console for the widget as they are unhandled until you put their ID in the config.

To get a console for the widget while it is running in OBS:
1. Create a shortcut on your desktop or edit one you already have, and add this in Target after the path, make sure to include a space before the first character: ` --remote-debugging-port=9222`
2. Launch [localhost:9222](http://localhost:9222) in your browser and pick `Streaming Widget`.
3. Activate the JavaScript/Development Console in your browser of choice.
