<?php
class Settings
{
    static function writeSettings(string $filePath, $inputRows, $append = false)
    {
        //Check if input was actually JSON, else just write the contents to file as it's a label
        if (!is_object($inputRows) && !is_array($inputRows)) {
            if ($append) $inputRows .= "\n";
            return file_put_contents($filePath, $inputRows, $append ? FILE_APPEND : 0);
        }

        // Encode input to CSV, write settings file
        if (!is_array($inputRows)) $inputRows = [$inputRows];
        $input = array();
        foreach ($inputRows as $row) {
            $result = [];
            foreach ($row as $key => $value) {
                $value = str_replace(['|', ';'], ['', ''], $value);
                if (is_numeric($key)) $result[] = $value;
                else $result[] = "$key|$value";
            }
            $input[] = implode(';', $result);
        }
        $inputString = implode("\n", array_filter($input)); // Filter removes empty items
        if ($append) $inputString .= "\n";
        return file_put_contents($filePath, $inputString, $append ? FILE_APPEND : 0);
    }

    static function readSettings($filePath)
    {
        $outputCsv = str_replace("\r", '', file_get_contents($filePath));
        $outputRows = explode("\n", $outputCsv);
        $output = [];
        foreach ($outputRows as $row) {
            $fields = explode(';', $row);
            $result = [];
            foreach ($fields as $field) {
                if (strpos($field, '|') !== false) {
                    $fieldParts = explode('|', $field);
                    $result[$fieldParts[0]] = $fieldParts[1];
                } else {
                    $result[] = $field;
                }
            }
            if (strlen($row) > 0) $output[] = $result;
        }
        return $output;
    }

    static function getFilePath($filename, $subfolder, $extension)
    {
        $subfolder = preg_replace('/\W+/', '_', $subfolder);
        $filename = preg_replace('/\W+/', '_', $filename);
        if (!empty($subfolder)) $filename = $subfolder . '/' . $filename;
        return "./_settings/$filename.$extension";
    }
}