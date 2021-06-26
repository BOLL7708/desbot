# Streaming Widget
A very bespoke browser-based widget for streaming.

This has been worked on as my own streaming solution, but I will try to make it usable by others, keep in mind it is still very much adapted to my own streaming setup, but comes ready with a pre-filled config sans private API keys etc.

Readme is incredibly WIP.

# What can it do?
1. Text to speech from rewards, of a bot's every message with optional filter or just every chat message. It's using GCP TTS with Wavenet voices.
2. OBS remote control, show/hide sources in OBS Studio from rewards.
3. Display SteamVR notifications though [OpenVRNotificationPipe](https://github.com/BOLL7708/OpenVRNotificationPipe)
4. Ability to trigger SteamVR screenshots via [SuperScreenShotterVR](https://github.com/BOLL7708/SuperScreenShotterVR)
5. Logging of chat or screenshots from SSVR (with embeds!) to Discord.
6. Listen to any rewards from Twitch PubSub and any chat message through Twitch Chat.

# IDE
This is necessary to generate that actual files that will run, TypeScript gets transpiled down to JavaScript. The config is also using TypeScripe interfaces so having this setup is sensible if you want to do frequent changes.
1. Install NPM through the Node.JS package: https://nodejs.org
2. Use NPM to install TypeScript: https://www.typescriptlang.org/download/ or just `npm install -g typescript` to install it globally.
3. Install Visual Studio Code: https://code.visualstudio.com/
4. Ctrl+SHIFT+P and run  `Tasks: Manage Automatic Tasks in Folder` and choose `Allow Automatic Tasks` in folder and restart VS Code.
5. Launch `Windows PowerShell` as administrator and run `Set-ExecutionPolicy RemoteSigned` to allow VSC to execute TSC.

# TTS (WIP docs)
1. Register for Google Cloud Platform, needs a billing accound.
2. Enable the Cloud Text to Speech API
3. Create credentials by adding a Service Account
4. Create an API key for the Cloud Text to Speech API

# OBS
Download and install the [OBS-Websocket](https://obsproject.com/forum/resources/obs-websocket-remote-control-obs-studio-from-websockets.466/) plugin and configure it in the application, set a password which you also set in the config for this widget.

# Twitch Integrations
Download the [Twitch Authenticator](https://github.com/jeppevinkel/twitch-oauth), and use these scopes when configuring it:
```
"scope": [
  "bits:read",
  "chat:read",
  "chat:edit",
  "whispers:read",
  "whispers:edit",
  "channel:read:redemptions",
  "channel:read:subscriptions"
]
```
Take the tokens and put them in a copy of `settings_twitch_tokens.csv.template` without `.template` at the end, that's it, the Widget will refresh the tokens every time you run it to allow for as long downtime as possible between sessions.