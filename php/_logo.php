<?php
include_once('_init.php');
$db = DB_SQLite::get();
$configArr = $db->getEntries('ConfigMain', 'Main');
$config = array_pop($configArr)->data;
$foregroundColor = $config->logo->foregroundColor ?? '#FFCA34';
$backgroundColor = $config->logo->backgroundColor ?? '#9146FF';

$logo = file_get_contents('../app/htdocs/media/desbot_logo.svg');
$logo = preg_replace('/\.bg.*{.*}/U', ".bg { fill: $backgroundColor; }", $logo);
$logo = preg_replace('/\.fg.*{.*}/U', ".fg { fill: $foregroundColor; }", $logo);
header('Content-Type: image/svg+xml');
echo $logo;