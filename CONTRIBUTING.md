# Contributing to desbot

Thank you for wanting to contribute to the project. The following is a set of guidelines for contributing to desbot, which is hosted on GitHub.

## Bugs
    
You can file a bug report on [GitHub][issues] and tag it as a bug, or on the official [Discord][discord] server, but please make sure to search for existing issues first.
    
## Suggestions

You can post a suggestion on [GitHub][issues] and tag it as an enhancement, or on the official [Discord][discord] server, but please make sure to search for existing suggestions first.

## Contributions

Right now the project is still coming together and will see a few more major changes, but it is built with extensibility in mind so in the future plugin development will be possible. 

If you want to contribute right now, the biggest need right now is frontend development as the editor is one massive class. Yeah, if you're a mildly masochistic programmer, get in touch on [Discord][discord]!
    
## Development

You don't need a special version of desbot to develop for it, the project is delivered as the source code, and can be modified at will. It is recommended to clone the project again though, so you have one bot to use when live, and one for development, unless you like to live dangerously.

## Roadmap

These are both conversions and new features. The order is not set in stone, but the first two are the most important.
1. The DB conversion took 16 months, but it's done, it's on here as there is some polish to do before continuing to the next thing.
2. Convert the backend of the project to Node.JS, this has a number of benefits.
   * NPM libraries for Twitch, Discord, etc. This will offload the API integration maintenance which will help a lot.
   * Node instead of Apache for HTTP serving, this will remove one installation to run the bot.
   * Node instead of PHP for page rendering and DB access, this will make for a more stable connection to SQLite.
   * Node to host a Websocket relay server, instead of relying on a separate application.
   * Node can run some browser APIs that can be offloaded from the browser component.
   * Node can be run on Windows, Mac, Linux and can thus likely run 24/7 on a Raspberry Pi.
3. Presenter - Break out the presentation part into a separate component. This will come automatically with the Node.JS conversion, but could be looked at beforehand. Basically all media playback and on screen overlays will be a separately hosted webpage that gets data over Websockets from the backend.     
4. Dashboard - Create a Stream Deck equivalent as a webpage, where reward and system features can be toggled or triggered. This is where the old game reward profile feature will come back as we can persist reward states for the running Steam game.

[issues]: https://github.com/BOLL7708/desbot/issues
[discord]: https://desbot.app/discord