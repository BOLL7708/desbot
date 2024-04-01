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
    if(
        is_file($filePath)
        && $version > $from
        && $version <= $to
    ) {
        $files[] = [$version, $filePath];
    }
}

// Run migrations
$db = DB_MySQL::get();
$lastOk = $from;
$finishedOk = true;
$finishedCount = 0;
$dumpResult = false;
if(count($files)) {
    $dumpBytes = DB_MySQL::dump();
    $dumpResult = $dumpBytes > 0;
}
usort($files, function($a, $b) { return $a[0] <=> $b[0]; });
foreach($files as $fileInfo) {
    $version = $fileInfo[0];
    $filePath = $fileInfo[1];
    $ok = $db->migrate($filePath);
    error_log("Migration from $from to $version was: $ok");
    if($ok) {
        $lastOk = $version;
        $finishedCount++;
    } else {
        $finishedOk = false;
        break;
    }
}

// Output result
Utils::outputJson((object) ['ok'=>$finishedOk, 'count'=>$finishedCount, 'id'=>$lastOk, 'dump'=>$dumpResult]);