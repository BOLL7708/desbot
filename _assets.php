<?php
function listFolderFiles($dir, $res)
{
    $it = new FilesystemIterator(
        $dir,
        FilesystemIterator::UNIX_PATHS
        | FilesystemIterator::SKIP_DOTS
    );
    foreach ($it as $fileInfo) {
        if ($fileInfo->isDir()) {
            $res = listFolderFiles($fileInfo->getPathname(), $res);
        } else {
            $res[] = $fileInfo->getPathname();
        }
    }
    return $res;
}
$files = listFolderFiles('_assets', []);

header('Content-Type: application/javascript');
echo json_encode($files);