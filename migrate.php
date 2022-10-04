<?php
include_once './init.php';

// Auth
Utils::checkAuth();

// Parameters
$from = intval($_REQUEST['from']);
$to = intval($_REQUEST['to']);

// Get which migrations to run
$files = [];
$root = './migrations/';
$dir = new DirectoryIterator($root);
foreach($dir as $file) {
    if($file->isFile()) {
        $num = intval($file->getBasename('.sql'));
        error_log("$num > $from && $num <= $to");
        if($num > $from && $num <= $to) {
            error_log("Adding migration to $num");
            $files[$num] = $root.$file->getFilename();
        }
    }
}

// Run migrations
$db = DB::get();
$lastOk = $from;
$finishedOk = true;
$finishedCount = 0;
foreach($files as $number => $filePath) {
    $ok = $db->migrate($filePath);
    error_log("Migration from $from to $number was: $ok");
    if($ok) {
        $lastOk = $number;
        $finishedCount++;
    } else {
        $finishedOk = false;
        break;
    }
}

// Output result
Utils::outputJson((object) ['ok'=>$finishedOk, 'count'=>$finishedCount, 'id'=>$lastOk]);