<?php
include_once './init.php';

// Auth
Utils::checkAuth();

// Prep
$files = [];
$root = './migrations/';
$dir = new DirectoryIterator($root);

// Parameters
$from = intval($_REQUEST['from'] ?? 0);
$to = intval($_REQUEST['to'] ?? 0);
if(!$from && !$to) {
    $topVersion = 0;
    foreach($dir as $file) {
        $num = intval($file->getBasename('.sql'));
        if($num > $topVersion) $topVersion = $num;
    }
    // Output result with latest version
    Utils::outputJson((object) ['version'=>$topVersion]);
}

// Get which migrations to run

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
if(count($files)) {
    // TODO: Do MySQL dump backup here!
}
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