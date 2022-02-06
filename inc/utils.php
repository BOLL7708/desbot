<?php

class Utils {
    static function loadJSFiles() {
        // Load PHP config
        $config = include('_configs/config.php');

        // Include single file
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
                && strpos($directory, 'templates') === false
                && strpos($directory, 'interfaces') === false
            ) {
                if(is_string($directory) && file_exists($root.$directory.'/'.$name)) {
                    echo '<script src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
                } elseif (file_exists($root.$name)) {
                    echo '<script src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
                }
            }
        }
    
        // Scan root for subfolders except configs and templates
        $root = './dist/';
        $dir = new DirectoryIterator($root);
        foreach ($dir as $file) {
            $name = $file->getFilename();
            if (
                $file->isDir() 
                && strpos($name, '_configs') === false
                && strpos($name, 'templates') === false
                && !$file->isDot()
                && substr($name,0,1) != '.'
            ) {
                $dir2 = new DirectoryIterator($root.$name);
                foreach($dir2 as $file2) {
                    includeFile($root, $file2, $name);
                    if($file2 == 'files.js') { // Filles a value in AssetFiles that needs to be filled before config loads.
                        echo '<script>AssetFiles._filePaths = '.json_encode(self::getAssetFiles(), JSON_UNESCAPED_SLASHES).'</script>';
                    }
                }
            }
        }

        // Manual includes from the root
        includeFile($root, 'utils.js');
        includeFile($root, 'main_controller.js');
        
        // Scan root for previously skipped configs
        $configPath = '_configs';       
        $configDir = new DirectoryIterator($root.$configPath);

        // Include pre-configs
        foreach($configDir as $configFile) {
            $configName = $configFile->getFileName();
            if(!$configFile->isDir() && strpos($configName, $config->preConfigSymbol) !== false) {
                includeFile($root, $configName, $configPath);
            }
        }

        // Include main config
        includeFile($root, 'config.js', $configPath);

        // Include post-configs
        foreach($configDir as $configFile) {
            $configName = $configFile->getFileName();
            if(!$configFile->isDir() && strpos($configName, $config->postConfigSymbol) !== false) {
                includeFile($root, $configName, $configPath);
            }
        }

        // Load any config override specified in the URL
        $configOverride = $_REQUEST['config'] ?? null;
        $overrideSymbol = $config->overrideConfigSymbol;
        if($configOverride != null) includeFile($root, "config$overrideSymbol$configOverride.js", $configPath);
    }
    
    static function decode($b64url) {
        $len = strlen($b64url);
        $pad = $len+4-($len%4);
        $b64 = str_pad(str_replace(['-', '_'], ['+', '/'], $b64url), $pad, '=');
        return base64_decode($b64);
    }

    static function getAssetFiles() {
        
        function listFolderFiles($dir, $res)
        {
            foreach (new DirectoryIterator($dir) as $fileInfo) {
                if (!$fileInfo->isDot()) {
                    if ($fileInfo->isDir()) {
                        $res = listFolderFiles($fileInfo->getPathname(), $res);
                    } else {
                        $res[] = str_replace('\\','/', $fileInfo->getPathname());
                    }
                }
            }
            return $res;
        }

        return listFolderFiles('_assets', []);
    } 
}
