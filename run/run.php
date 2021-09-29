<?php
$window = $_REQUEST['window'] ?? null;
$command = $_REQUEST['command'] ?? null;

if(!$window || !$command) return "Missing window or command.";

$window = base64_decode($window);
$command = base64_decode($command);

$run = "\"run.exe\" \"$window\" \"$command{ENTER}\" 2>&1";
shell_exec($run);