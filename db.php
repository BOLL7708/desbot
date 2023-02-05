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

function getHeaderValue(string $field): string|null {
    $headers = getallheaders();
    return $headers[$field] ?? $headers[strtolower($field)] ?? null;
}

// Parameters
$groupClass = getHeaderValue('X-Group-Class');
if($method !== 'get' && !$groupClass) {
    Utils::exitWithError('X-Group-Class is required in header when not using GET', 2004);
}
$groupKey = getHeaderValue('X-Group-Key');
$rowIds = array_filter(explode(',', getHeaderValue('X-Row-Ids') ?? ''));
$dataJson = file_get_contents('php://input'); // Raw JSON as a string.
$newGroupKey = getHeaderValue('X-New-Group-Key');
$rowIdList = !!getHeaderValue('X-Row-Id-List');
$rowIdLabel = getHeaderValue('X-Row-Id-Label');

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
        if($rowIdList) {
            // Only row IDs with labels
            $output = $db->getRowIdsWithLabels($groupClass, $rowIdLabel);
        }
        elseif($rowIds && count($rowIds) > 0) {
            // Entries based on IDs
            $output = $db->getEntriesByIds($rowIds);
        }
        elseif(!$groupClass || str_contains($groupClass, '*')) {
            // Only classes with counts
            $output = $db->getClassesWithCounts($groupClass);
        }
        elseif($groupKey) {
            // Single entry based on key
            $output = $db->getEntries($groupClass, $groupKey);
            $array = is_object($output) ? get_object_vars($output) : $output;
            $output = array_pop($array);
        } else {
            // All entries for a group
            $output = $db->getEntries($groupClass);
        }
        break;
}

// Output
$db->output($output);