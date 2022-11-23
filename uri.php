<?php
include_once './init.php';
Utils::checkAuth();

$uri = $_REQUEST['uri'] ?? null;

if(!$uri) {
    http_response_code(400);
    exit("Missing parameter(s)");
}

$uri = Utils::decode($uri);
shell_exec("start $uri");