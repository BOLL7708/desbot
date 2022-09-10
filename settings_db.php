<?php
// Init
include_once './init.php';
$db = DB::get();

// Auth
$authorization = getallheaders()['Authorization'] ?? getallheaders()['authorization'] ?? null;
$config = include_once('./_configs/config.php');
$authParts = explode(' ', $authorization) ?? [];
$password = array_pop($authParts);
$isAuthed = $config->password == Utils::decode($password);
if(!$authorization || !$isAuthed) {
    Utils::exitWithError('unauthorized');
}

// Parameters
$isPost = $_SERVER['REQUEST_METHOD'] == 'POST';
$groupClass = $_GET['class'] ?? $_GET['groupClass'] ?? null;
if(!$groupClass) Utils::exitWithError('group class was not supplied in request');
$groupKey = $_GET['key'] ?? $_GET['groupKey'] ?? null;
$dataJson = file_get_contents('php://input'); // Raw JSON as a string.

// Execute
$output = null;
if($isPost) {
    $output = $db->saveSetting(
        $groupClass,
        $groupKey,
        $dataJson
    );
} else {
    $output = $db->getSettings(
        $groupClass,
        $groupKey
    );
    if($groupKey) {
        $output = array_pop($output);
    }
}

// Output
$db->output($output);