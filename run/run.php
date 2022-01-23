<?php
include_once('../inc/utils.php');

$window = $_REQUEST['window'] ?? null;
$command = $_REQUEST['command'] ?? null;
$enter = ($_REQUEST['enter'] ?? '1') == '1';
$password = getallheaders()['password'] ?? null;

$cfg = include_once('../_configs/config.php');
if($cfg->password != Utils::decode($password)) {
    http_response_code(403);
    exit("Unauthorized");
}
if(!$window || !$command) {
    http_response_code(422);
    exit("Missing parameter(s)");
}

$window = Utils::decode($window);
$command = Utils::decode($command);

$enterPostfix = $enter ? '{ENTER}' : '';
$run = "\"run.exe\" \"$window\" \"$command$enterPostfix\" 2>&1";
shell_exec($run);

