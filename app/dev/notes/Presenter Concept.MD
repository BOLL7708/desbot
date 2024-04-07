# Presenter
## Description
The Presenter is a webpage that remotely gets commanded to display images or video and play back audio,
that is used as a browser source in OBS. The page itself connects to the main part of the bot that will send it messages
over Websockets of what to do.

## User Stories
### Multiple instances of the Presenter
**As a**: streamer called c0ldvengeance   
**I want to**: be able to control the output (image/audio) for different things in OBS  
**So that**: I can apply effects to only the TTS output.

## Structure
PERSISTENT - ALWAYS IN PLACE  
TRANSIENT - DRAWN AND DISMISSED  
DATA LINES - SUBMIT THINGS TO PERSISTENT ELEMENTS  
ACTIONS - SPAWN TRANSIENT WITH DATA OR SEND DATA TO PERSISTENT  

### Presets
* A group of new Presets that represent the different components that are possible to use with a Presenter.
* A preset should include the specific properties that are used for the component it represents.
* A preset could include an implementation of a component if it is an HTML component that uses code.

### Protocol
* Use the WSRelay application, it will be completely replaced by Node later with a full port, so it will be a drop-in replacement.
* We will send JSON payloads to a registered Presenter, we register Presenters to their individual relay channels.
* The JSON payloads will have an associated class, and that class will be re-instantiated on the Presenter side so methods on it can be accessed to build the component or run stuff.
```json 
{
  "class": "PresetPipe",
  "data": {
    "image": "https://example.com/image.png",
    "text": "Hello, World!"
  }
}
```

# TODO
Think of how to define a preset and how to customize it from outside.

### Action
* A new Action that will send Presets to a Presenter: like audio, images, video, HTML, etc.
* This should include
### Config
* A new Config that will define persistent features in a Presenter: like frames, chat, graphics, etc.

## Components
1. Audio player
    * Supports multiple audio channels and the other properties currently part of the existing audio player.
2. Video player
    * This is a new feature, and should be able to play back local or remote video files that are browser compatible.
3. Pipe analog
    * This will use the custom pipe presets and display the same image with the same text fields
4. HTML injectors
    * Twitch Chat
    * Canvas renderer
    * Physics enabled component?
5. Webpage in an iframe?!?! Maybe a bit too ridiculous?