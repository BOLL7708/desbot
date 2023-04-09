<?php
ini_set('display_errors', 0);
include_once '_init.php';

// Auth
Utils::checkAuth();

// Prep
$migrations = Utils::getMigrations();

// Parameters
$from = intval($_REQUEST['from'] ?? 0);
$to = intval($_REQUEST['to'] ?? 0);

// Output the latest version
if(!$from && !$to) {
    $topVersion = 0;
    foreach($migrations as $version => $filePath) {
        if($version > $topVersion) $topVersion = $version;
    }
    Utils::outputJson((object) ['version'=>$topVersion]);
}

// Get which migrations to run
$files = [];
foreach($migrations as $version => $filePath) {
    if(is_file($filePath)) {
        error_log("$version > $from && $version <= $to");
        if($version > $from && $version <= $to) {
            error_log("Adding migration to $version");
            $files[$version] = $filePath;
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
sort($files, );
foreach($files as $number => $filePath) {
    $ok = $db->migrate($filePath);
    error_log("Migration from $from to $number was: $ok");
    if($ok) {
        $lastOk = $filePath;
        $finishedCount++;
    } else {
        $finishedOk = false;
        break;
    }
}

// Output result
Utils::outputJson((object) ['ok'=>$finishedOk, 'count'=>$finishedCount, 'id'=>$lastOk]);