<?php
include_once('./init.php');

$path = $_REQUEST['path'] ?? $_REQUEST['p'] ?? '';
if(empty($path)) Utils::exitWithError('path was not supplied');

$method = strtolower($_SERVER['REQUEST_METHOD'] ?? '');
$input = file_get_contents('php://input');
$data = json_decode($input) ?? $input;
error_log("GOT $method FOR $path");
switch($method) {
    case 'post':
        $bytes = Files::write($path, $data);
        if($bytes !== false) http_response_code(200);
        else Utils::exitWithError('unable to write data');
        break;
    case 'put':
        $bytes = Files::write($path, $data, true);
        if($bytes !== false) http_response_code(200);
        else Utils::exitWithError('unable to append data');
        break;
    default:
        $data = Files::read($path);
        if(is_object($data) || is_array($data)) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($data);
        } else if($data !== null) {
            header('Content-Type: plain/text; charset=utf-8');
            echo strval($data);
        } else {
            Utils::exitWithError('unable to read data');
        }
        break;
}