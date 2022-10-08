<?php
class Files {
    static private string $rootDir = './_data';

    // region Main Read/Write
    /**
     * @param string $path
     * @param stdClass|array|string $data
     * @param bool $append
     * @return bool|int
     */
    static public function write(string $path, stdClass|array|string $data, bool $append = false):bool|int {
        self::ensureFolderExists($path);
        $pathArr = explode('.', $path);
        $ext = strtolower(array_pop($pathArr) ?? '');
        $fullPath = self::getFullPath($path);
        if(is_string($data)) {
            $result = self::printTXT($fullPath, $data, $append);
        } else {
            $result = match ($ext) {
                'php' => self::printPHP($fullPath, $data),
                'json' => self::printJSON($fullPath, $data),
                default => self::printTXT($fullPath, $data, $append),
            };
        }
        return $result;
    }

    /**
     *
     * @param string $path
     * @return stdClass|array|string|null
     */
    static public function read(string $path): stdClass|array|string|null {
        $pathArr = explode('.', $path);
        $ext = strtolower(array_pop($pathArr) ?? '');
        $fullPath = self::getFullPath($path);
        self::ensureFolderExists($fullPath);
        return match ($ext) {
            'php' => @include($fullPath) ?? '',
            'json' => json_decode(file_get_contents($fullPath)),
            default => file_get_contents($fullPath),
        };
    }
    // endregion

    // region Utils

    /**
     * Get the full path for a file.
     * @param string $path
     * @return string
     */
    static private function getFullPath(string $path): string {
        return self::$rootDir.'/'.self::cleanPath($path);
    }

    /**
     * Removes ../ including variants from a path, to prevent saving files outside the _data folder.
     * @param string $path
     * @return string
     */
    private static function cleanPath(string $path): string {
        // TODO: Also replace backslashes with forward slashes?
        return preg_replace('/(\.+[\/\\\\])/', '', $path) ?? '';
    }

    /**
     * Generates the PHP code that would represent the incoming data.
     * @param $data
     * @return string
     */
    static private function makePHP($data): string {
        $arrArr = [];
        if(is_object($data)) {
            foreach($data as $key => $value) $arrArr[] = "\"$key\"=>".self::makePHP($value);
            $arrStr = implode(',', $arrArr);
            return "(object) [$arrStr]";
        } elseif(is_array($data)) {
            $isAssociative = Utils::isArrayAssociative($data);
            foreach($data as $key => $value) $arrArr[] = $isAssociative ? "\"$key\"=>".self::makePHP($value) : self::makePHP($value);
            $arrStr = implode(',', $arrArr);
            return "[$arrStr]";
        } elseif(is_bool($data)) {
            return $data ? 'true' : 'false';
        } elseif(is_numeric($data)) {
            return "$data";
        } elseif(is_string($data)) {
            return "'$data'";
        } elseif(is_null($data)) {
            return 'null';
        } else return '';
    }

    /**
     * @param string $path
     * @return void
     */
    static private function ensureFolderExists(string $path): void {
        $pathArr = explode('/', $path);
        array_pop($pathArr);
        $path = implode('/', $pathArr);
        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }
    }

    // endregion

    // region Converters/Printers

    /**
     * @param string $path
     * @param stdClass|array|string $data
     * @param bool $append
     * @return false|int False on failure, else bytes written.
     */
    static private function printTXT(
        string $path,
        stdClass|array|string $data,
        bool $append = false
    ): false|int {
        error_log("Printing TXT to: $path, appending: $append");
        if(is_object($data) || is_array($data)) {
            ob_start();
            var_dump($data);
            $data = ob_get_clean();
        }
        $flags = $append ? FILE_APPEND : 0;
        $size = @filesize($path);
        if($size && $append) $data = "\n$data";
        return file_put_contents($path, strval($data), $flags);
    }

    /**
     * @param string $path
     * @param stdClass|array $data
     * @return bool|int False on failure, else bytes written.
     */
    static private function printJSON(string $path, stdClass|array $data): bool|int
    {
        error_log("Printing JSON to: $path");
        return file_put_contents($path, json_encode($data));
    }

    static private function printPHP(string $path, stdClass|array $data): bool|int {
        error_log("Printing PHP to: $path");
        $phpCode = self::makePHP($data);
        return file_put_contents($path, '<?php return '.$phpCode.';');
    }
    // endregion
}