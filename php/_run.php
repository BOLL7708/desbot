<?php

use inc\Utils;

include_once '_init.php';
Utils::checkAuth();

$window = $_REQUEST['window'] ?? null;
$command = $_REQUEST['command'] ?? null;
$enter = ($_REQUEST['enter'] ?? '1') == '1';
$type = $_REQUEST['type'] ?? 'keys'; // Alternatively 'mouse'

if(!$window || !$command) {
    http_response_code(400);
    exit("Missing parameter(s)");
}

$window = Utils::decode($window);
$command = Utils::decode($command);

$enterPostfix = $enter ? '{ENTER}' : '';
$run = "\"exec\\run.exe\" \"$window\" \"$type\" \"$command$enterPostfix\" 2>&1";
shell_exec($run);