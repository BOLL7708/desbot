<?php

class Utils {
    static function loadJSFiles() {
        function includeFile($root, $file, $directory=null) {
            if(is_string($file)) {
                $name = $file;
                $fileArr = explode('.', $file);
                $ext = array_pop($fileArr);
            } else {
                $name = $file->getFilename();
                $ext = $file->getExtension();
            }
            if(
                $ext == 'js' 
                && strpos($directory, '_templates') === false
                && strpos($directory, 'interfaces') === false
            ) {
                if(is_string($directory) && file_exists($root.$directory.'/'.$name)) {
                    echo '<script src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
                } elseif (file_exists($root.$name)) {
                    echo '<script src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
                }
            }
        }
    
        $root = './dist/';
        $dir = new DirectoryIterator($root);
        foreach ($dir as $file) {
            $name = $file->getFilename();
            if (
                $file->isDir() 
                && strpos($name, '_configs') === false
                && !$file->isDot()
                && substr($name,0,1) != '.'
            ) {
                $dir2 = new DirectoryIterator($root.$name);
                foreach($dir2 as $file2) {
                    includeFile($root, $file2, $name);
                }
            }
        }
    
        $configOverride = $_REQUEST['config'] ?? null;

        // We want to embed config last so it can access constants in modules.
        includeFile($root, 'utils.js');
        includeFile($root, 'main_controller.js');
        
        // Includ everything regarding configs
        $configPath = '_configs';
        includeFile($root, 'secure.base.js', $configPath); // Things like tokens etc
        includeFile($root, 'config.base.js', $configPath); // Everything else, probably
        $configDir = new DirectoryIterator($root.$configPath);
        foreach($configDir as $configFile) {
            error_log($configFile->getFilename());
            $configName = $configFile->getFileName();
            if(
                !$configFile->isDir()
                && strpos($configName, '_') !== false
            ) {
                includeFile($root, $configName, $configPath);
            }
        }
        
        if($configOverride != null) includeFile($root, "config.$configOverride.js", $configPath);
    }
    
    static function decode($b64url) {
        $len = strlen($b64url);
        $pad = $len+4-($len%4);
        $b64 = str_pad(str_replace(['-', '_'], ['+', '/'], $b64url), $pad, '=');
        return base64_decode($b64);
    }
}
