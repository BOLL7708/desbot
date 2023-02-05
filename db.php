<?php
// Init
include_once './init.php';
$db = DB::get();

// Auth
Utils::checkAuth();

// Test
$method = strtolower($_SERVER['REQUEST_METHOD']);
if($method === 'head') {
    $ok = $db->test();
    http_response_code($ok ? 200 : 400);
    exit;
}

// Parameters
$headers = getallheaders();
$groupClass = $headers['X-Group-Class'] ?? $headers['x-group-class'] ?? null;
if($method !== 'get' && !$groupClass) {
    Utils::exitWithError('X-Group-Class is required in header when not using GET', 2004);
}
$groupKey = $headers['X-Group-Key'] ?? $headers['x-group-key'] ?? null;
$dataJson = file_get_contents('php://input'); // Raw JSON as a string.
$newGroupKey = $headers['X-New-Group-Key'] ?? $headers['x-new-group-key'] ?? null;
$getRowIds = !!($headers['X-Row-Ids'] ?? $headers['x-row-ids'] ?? null);
$getRowIdLabel = $headers['X-Row-Id-Label'] ?? $headers['x-row-id-label'] ?? null;

// Execute
$output = null;
switch($method) {
    case 'post':
        $updatedKey = false;
        if($groupKey !== null && $newGroupKey !== null) {
            $updatedKey = $db->updateKey($groupClass, $groupKey, $newGroupKey);
        }
        $result = $db->saveEntry(
            $groupClass,
            $updatedKey ? $newGroupKey : $groupKey,
            $dataJson
        );
        $output = $result !== false ? ['result'=>true, 'groupKey'=>$result] : $result;
        break;
    case 'delete':
        $output = $db->deleteSetting(
            $groupClass,
            $groupKey
        );
        break;
    default: // GET, etc
        if($getRowIds) {
            $output = $db->getRowIdsWithLabels($groupClass, $getRowIdLabel); // Only row IDs and labels
        }
        elseif(!$groupClass || str_contains($groupClass, '*')) {
            $output = $db->getClassesWithCounts($groupClass); // All when null, else filtered
        }
        else {
            if($groupKey) {
                $output = $db->getEntries($groupClass, $groupKey);
                $array = is_object($output) ? get_object_vars($output) : $output;
                $output = array_pop($array);
            } else $output = $db->getEntries($groupClass);
        }
        break;
}

// Output
$db->output($output);