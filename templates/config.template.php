<?php 
return (object) [
    /**
     * The Client ID for your registered application on Twitch.
     */
    'twitchClientId' => '',
    
    /**
     * The Client Secret for your registered application on Twitch.
     */
    'twitchClientSecret' => '',
    
    /**
     * Password for system operations that PHP performs, like writing to disk.
     * Note: Also fill in the same password in `Config.credentials.PHPPassword`, by default in `_configs/config.ts`.
     */
    'password'=>'',

    /**
     * Symbols for organizing the embedding of JavaScript configs.
     */
    'preConfigSymbol'=>'-',
    'postConfigSymbol'=>'+',
    'overrideConfigSymbol'=>'='
];