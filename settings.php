<?php
include_once('./inc/Utils.inc.php');
include_once('./inc/Settings.inc.php');

$method = $_SERVER['REQUEST_METHOD'];
$setting = $_GET['setting'] ?? null;
$password = getallheaders()['password'] ?? null;

$cfg = include_once('./_configs/config.php');
if($cfg->password != Utils::decode($password)) {
    http_response_code(403);
    exit("Unauthorized");
}
if($setting === null) {
    http_response_code(422);
    exit("Missing parameter(s)");
}


// Extract parts
$setting = urldecode($setting);

// Extract extension
$extension = 'csv';
$settingArr = explode('.', $setting);
if(is_array($settingArr) && count($settingArr) == 2) {
    $setting = $settingArr[0];
    $extension = $settingArr[1];
}

// Extract possibly subfolder
$subfolder = '';
$settingArr = explode('/', $setting);
if(is_array($settingArr) && count($settingArr) == 2) {
    $subfolder = $settingArr[0];
    $setting = $settingArr[1];
}
if(!empty($subfolder) && !is_dir('./_settings/'.$subfolder)) {
    mkdir('./_settings/'.$subfolder);
}

// Clean setting name
$setting = str_replace(['.', '/', '\\'], '', $setting);
$filePath = Settings::getFilePath($setting, $subfolder, $extension);

if($method === 'POST' || $method === 'PUT') { 
    // Get and decode input
    $inputJson = file_get_contents('php://input');
    $inputRows = json_decode($inputJson);

    // Save settings
    $success = Settings::writeSettings($filePath, $inputRows, $method === 'PUT');
    if($success !== false) exit("Settings written");
    else {
        http_response_code(400);
        exit("Could not write file to disk");
    }
} else { // GET
    // Load settings
    if(!file_exists($filePath)) {
        http_response_code(404); 
        exit("File does not exist");
    }
    $contents = Settings::readSettings($filePath);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode($contents));
}