<?php

use JetBrains\PhpStorm\NoReturn;

class Utils {
    static function printJSIncludesAndConfigs(): void {
        // Load PHP config
        $config = include_once('_configs/config.php');

        // Include single file
        function includeFile($root, $file, $directory=null): void {
            if (is_string($file)) {
                $name = $file;
                $fileArr = explode('.', $file);
                $ext = array_pop($fileArr);
            } else {
                $name = $file->getFilename();
                $ext = $file->getExtension();
            }
            if ($ext == 'js') {
                if(is_string($directory) && file_exists($root.$directory.'/'.$name)) {
                    echo '<script type="module" src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
                } elseif (file_exists($root.$name)) {
                    echo '<script type="module" src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
                }
            }
        }

        // Setup
        $root = './dist/';

        // Include files that aren't modules
        $includesPath = 'Includes';
        $includesDir = new DirectoryIterator($root.$includesPath);
        foreach($includesDir as $includeFile) {
            $includeName = $includeFile->getFileName();
            if(!$includeFile->isDir()) {
                includeFile($root, $includeName, $includesPath);
            }
        }

        // Scan root for previously skipped configs
        $configPath = '_configs';       
        $configDir = new DirectoryIterator($root.$configPath);

        // Include pre-configs
        foreach($configDir as $configFile) {
            $configName = $configFile->getFileName();
            if(!$configFile->isDir() && str_contains($configName, $config->preConfigSymbol)) {
                includeFile($root, $configName, $configPath);
            }
        }

        // Include main config
        includeFile($root, 'config.js', $configPath);

        // Include post-configs
        foreach($configDir as $configFile) {
            $configName = $configFile->getFileName();
            if(!$configFile->isDir() && str_contains($configName, $config->postConfigSymbol)) {
                includeFile($root, $configName, $configPath);
            }
        }

        // Load any config override specified in the URL
        $configOverride = $_REQUEST['config'] ?? null;
        $overrideSymbol = $config->overrideConfigSymbol;
        if($configOverride != null) includeFile($root, "config$overrideSymbol$configOverride.js", $configPath);
    }

    static function printJSAssetFiles(): void {
        echo 'AssetsHelper._filePaths = '.json_encode(self::getAssetFiles(), JSON_UNESCAPED_SLASHES);
    }
    
    static function decode(string $b64url): false|string {
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
    static function postForm(string $url, array $postVars = array()): false|null|string {
        $postStr = http_build_query($postVars);
        return Utils::post($url, $postStr, 'application/x-www-form-urlencoded');
    }
    /**
     * Do POST request with JSON data.
     */
    static function postJSON(string $url, array $postVars = array()): false|null|string {
        $postStr = json_encode($postVars);
        return Utils::post($url, $postStr, 'application/json');
    }
    /**
     * Do POST request.
     */
    static function post(string $url, $postStr = '', string $contentType = ''): null|string {
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

    static function get(string $url, array $headers = array()): false|string {
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

    #[NoReturn] static function exitWithError(string $message, int $code = -1, int $httpCode = 400): void
    {
        error_log("Terminated script: $message, $code");
        header("Streaming-Widget-Error-Code: $code");
        header("Streaming-Widget-Error-Message: $message");
        self::outputJson(['error'=>$message, 'code'=>$code], $httpCode);
    }

    #[NoReturn] static function outputJson(array|stdClass $body, int $code = 200): void
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($code);
        $body = json_encode($body);
        echo $body;
        exit;
    }

    static function isArrayAssociative(array $arr): bool {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    public static function includeFolder(string $folder): void
    {
        $dir = new DirectoryIterator($folder);
        foreach($dir as $entry) {
            $name = $entry->getFileName();
            if(!$entry->isDir()) {
                include "$folder/$name";
            }
        }
    }

    public static function sha256(string $text): string
    {
        return hash('sha256', $text);
    }

    public static function getAuth(): stdClass {
        $password = getallheaders()['Authorization'] ?? getallheaders()['authorization'] ?? '';
        $data = Files::read(AUTH_PATH);
        $hash = $data->hash ?? '';
        $ok = self::sha256($password) === $hash;

        $result = new stdClass();
        $result->password = $password;
        $result->hash = $hash;
        $result->ok = $ok;

        return $result;
    }
    public static function checkAuth(): void
    {
        $auth = self::getAuth();
        if(empty($auth->password)) Utils::exitWithError('no password in authorization header', 9001, 401);
        if(!$auth->hash) Utils::exitWithError('no hash to compare password to', 9002, 401);
        if(!$auth->ok) Utils::exitWithError('password did not match', 9003, 401);
    }

    /*
     * Gets the lowercase string name sans extension for the currently running script.
     */
    public static function getScriptFileName(): string {
        $path = $_SERVER['SCRIPT_NAME'] ?? '';
        $pathArr = explode('/', $path);
        $fileNameExt = array_pop($pathArr) ?? '';
        $fileNameArr = explode('.', $fileNameExt);
        $fileName = array_shift($fileNameArr) ?? '';
        return strtolower($fileName);
    }

    /**
     * Gets all query parameters from a string URL.
     */
    public static function getQueryParams(string $url = ''): array
    {
        if(empty($url)) $url = $_SERVER['REQUEST_URI'];
        $result = [];
        if(str_contains($url, '?')) {
            $urlArr = explode('?', $url);
            $paramsStr = array_pop($urlArr);
            $params = explode('&', $paramsStr);
            foreach($params as $param) {
                $pair = explode('=', $param);
                if(count($pair) == 2) {
                    $result[$pair[0]] = $pair[1];
                }
            }
        }
        return $result;
    }
    public static function getMigrations(): array {
        $migrations = [];
        $root = './migrations/';
        $ext = '.sql';
        $dir = new DirectoryIterator($root);
        foreach($dir as $file) {
            $version = intval($file->getBasename($ext));
            $migrations[$version] = $root.$file->getFilename();
        }
        return $migrations;
    }
}
