<?php 
/**
 * Fill in a password in the empty password property below.
 * Fill in the same password in Config.controller.phpPassword in _configs/config.ts
 */

return (object) [
    // Used to authenticate for file writes using settings.php
    'password'=>'',

    // Symbols to match config files when loading JavaScript configs.
    'preConfigSymbol'=>'-',
    'postConfigSymbol'=>'+',
    'overrideConfigSymbol'=>'=',
];