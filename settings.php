<?php
$method = $_SERVER['REQUEST_METHOD'];
$setting = $_GET['setting'] ?? null;

if($setting === null) {
    http_response_code(422);
    exit("No settings file defined");
}
$filePath = getFilePath($setting);

if($method === 'POST') { 
    // Save settings
    $success = writeSettings($filePath);
    if($success) exit("Settings written");
    else {
        http_response_code(400);
        exit("Could not write file to disk");
    }
} else { 
    // Load settings
    if(!file_exists($filePath)) {
        http_response_code(404); 
        exit("File does not exist");
    }
    $contents = readSettings($filePath);
    header("Content-Type: application/json");
    exit(json_encode($contents));
}

function writeSettings($filePath) {
    $inputJson = file_get_contents('php://input');
    $inputRows = json_decode($inputJson);
    $input = array();
    foreach($inputRows as $row) {
        $input[] = implode(';', $row);
    }
    $inputString = implode("\n", $input);
    return file_put_contents($filePath, $inputString);
}

function readSettings($filePath) {
    $outputCsv = file_get_contents($filePath);
    $outputRows = explode("\n", $outputCsv);
    $output = array();
    foreach($outputRows as $row) {
        $output[] = explode(';', $row);
    }
    return $output;
}

function getFilePath($filename) {
    $filename = preg_replace('/\W+/', '_', $filename);
    return "./settings/$filename.csv";
}