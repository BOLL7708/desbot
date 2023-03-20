<?php
function getAllFiles($root, $ext, $level): array
{
    $contents = @scandir($root, SCANDIR_SORT_NONE);
    $files = [];
    $includeRootDirs = [
        'Classes',
        'Enums',
        'Objects'
    ];
    foreach ($contents as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $path = "$root/$entry";
        if (is_dir($path)) {
            if($level === 0 && !in_array($entry, $includeRootDirs)) continue;
            $files = array_merge($files, getAllFiles($path, $ext, $level+1));
        } elseif (is_file($path) && 0 === strcasecmp($ext, pathinfo($path, PATHINFO_EXTENSION))) {
            $files[] = $path;
        }
    }
    return $files;
}

$dir = "../dist";
$js_files = getAllFiles($dir, 'js', 0);

header('Content-Type: application/javascript');
foreach ($js_files as $file) {
    echo "import '{$file}';\n";
}