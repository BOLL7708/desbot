<?php
include_once('../inc/Utils.inc.php');

$uri = $_REQUEST['uri'] ?? null;
$password = getallheaders()['password'] ?? null;

$cfg = include_once('../_configs/config.php');
if($cfg->password != Utils::decode($password)) {
    http_response_code(403);
    exit("Unauthorized");
}
if(!$uri) {
    http_response_code(422);
    exit("Missing parameter(s)");
}

$uri = Utils::decode($uri);
shell_exec("start $uri");