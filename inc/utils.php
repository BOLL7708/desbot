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
                && strpos($name, 'template') === false
                && strpos($directory, 'interfaces') === false
            ) {
                if(is_string($directory)) {
                    echo '<script src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
                } elseif ($directory) {
                    echo '<script src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
                }
            }
        }
    
        $root = './dist/';
        $dir = new DirectoryIterator($root);
        foreach ($dir as $file) {
            $name = $file->getFilename();
            if (
                $file->isDir() && 
                !$file->isDot() && 
                substr($name,0,1) != '.'
            ) {
                $dir2 = new DirectoryIterator($root.$name);
                foreach($dir2 as $file2) {
                    includeFile($root, $file2, $name);
                }
            } else {
                includeFile($root, $file, null);
            }
        }
    
        $configOverride = $_REQUEST['config'] ?? null;

        // We want to embed config last so it can access constants in modules.
        includeFile($root, 'utils.js', true);
        includeFile($root, 'main_controller.js', true);
        includeFile($root, 'secure.base.js', true);
        includeFile($root, 'config.base.js', true);
        if($configOverride != null) includeFile($root, "config.$configOverride.js", true);
    }
    
    static function decode($b64url) {
        $len = strlen($b64url);
        $pad = $len+4-($len%4);
        $b64 = str_pad(str_replace(['-', '_'], ['+', '/'], $b64url), $pad, '=');
        return base64_decode($b64);
    }
}
