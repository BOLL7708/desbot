<?php
class Config {
    static stdClass|null $_cache = null;
    static function get() {
        if(self::$_cache == null) self::$_cache = include_once('./_configs/config.php');
        return self::$_cache;
    }
}
