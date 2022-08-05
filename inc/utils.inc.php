<?php

class Utils {
    static function loadJSFiles() {
        // Load PHP config
        $config = include_once('_configs/config.php');

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
            ) {
                if(is_string($directory) && file_exists($root.$directory.'/'.$name)) {
                    echo '<script src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
                } elseif (file_exists($root.$name)) {
                    echo '<script src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
                }
            }
        }

        // Setup
        $root = './dist/';

        // Include base first
        $dataPath = 'base';
        $dir = new DirectoryIterator($root.$dataPath);
        foreach ($dir as $file) {
            includeFile($root, $file, $dataPath);
        }

        // Include data second
        $dataPath = '_data';
        $dir = new DirectoryIterator($root.$dataPath);
        foreach ($dir as $file) {
            includeFile($root, $file, $dataPath);
        }
    
        // Scan root for files and subfolders except base, configs, data and templates
        $dir = new DirectoryIterator($root);
        foreach ($dir as $file) {
            $name = $file->getFilename();
            if (
                $file->isDir()
                && strpos($name, 'base') === false
                && strpos($name, '_configs') === false
                && strpos($name, '_data') === false
                && strpos($name, 'templates') === false
                && !$file->isDot()
                && substr($name,0,1) != '.'
            ) { // Subdirectory to scan
                $dir2 = new DirectoryIterator($root.$name);
                foreach($dir2 as $file2) {
                    includeFile($root, $file2, $name);
                    if($file2 == 'files.js') { // Fill a value in AssetFiles that needs to be filled before config loads.
                        echo '<script>AssetFiles._filePaths = '.json_encode(self::getAssetFiles(), JSON_UNESCAPED_SLASHES).'</script>';
                    }
                }
            } elseif($file->isFile()) includeFile($root, $file); // File in root
        }

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
    
    static function decode(string $b64url) {
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

    /**
     * Do POST request with form data.
     */
    static function postForm(string $url, array $postVars = array()) {
        $postStr = http_build_query($postVars);
        return Utils::post($url, $postStr, 'application/x-www-form-urlencoded');
    }
    /**
     * Do POST request with JSON data.
     */
    static function postJSON(string $url, array $postVars = array()) {
        $postStr = json_encode($postVars);
        return Utils::post($url, $postStr, 'application/json');
    }
    /**
     * Do POST request.
     */
    static function post(string $url, $postStr = '', string $contentType = ''){
        $options = array(
            'http' =>
                array(
                    'method'  => 'POST',
                    'header'  => "Content-type: $contentType",
                    'content' => $postStr
                )
        );
        $streamContext = stream_context_create($options);
        $result = null;
        try {
            $result = file_get_contents($url, false, $streamContext);
        } catch(Exception $e){
            error_log($e);
        }
        return $result;
    }

    static function get(string $url, array $headers = array()) {
        $options = array(
            'http' =>
                array(
                    'method' => 'GET',
                    'header' => implode("\r\n", $headers)
                )
        );
        $context = stream_context_create($options);
        return file_get_contents($url, false, $context);
    }
}
