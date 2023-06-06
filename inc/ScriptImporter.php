<?php
function getAllFiles($root, $ext, $level): array
{
    $contents = @scandir($root, SCANDIR_SORT_NONE);
    $files = [];
    $includeRootDirs = [
        // 'Classes',
        'Enums',
        'Objects',
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
usort($js_files, function($a, $b) {
    $ca = substr_count($a, "/");
    $cb = substr_count($b, "/");
    return $ca <=> $cb;
});
header('Content-Type: application/javascript');
?>
async function runScriptImports() {
    console.log('Starting script imports...')
<?php
foreach ($js_files as $file) {
    // I did a test with awaiting some imports to try and fix reference errors.
    // This brought with it the problem that any other code referencing the
    // data objects would not find the reference though...
    // The editor might be broken on low performance systems due to this.
    // Will have to find a better way of importing non-referenced classes to fix this.
    echo "\timport('{$file}')\n";
}
?>
    console.log('Finished importing <?=count($js_files)?> scripts!')
}
runScriptImports()