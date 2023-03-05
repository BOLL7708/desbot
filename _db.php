<?php
// Init
include_once '_init.php';
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
$noData = !!getHeaderValue('X-No-Data');

// Execute
$output = null;
switch($method) {
    case 'post':
        $updatedKey = false;
        if($groupKey !== null && $newGroupKey !== null) { // Edit key
            $updatedKey = $db->updateKey($groupClass, $groupKey, $newGroupKey);
            $groupKey = $newGroupKey;
        }
        if($groupKey === null && $newGroupKey !== null) { // New key
            $groupKey = $newGroupKey;
        }
        $result = $db->saveEntry( // Insert or update data
            $groupClass,
            $groupKey,
            $dataJson
        );
        $output = $result !== false ? ['result'=>true, 'groupKey'=>$result] : false;
        break;
    case 'delete':
        $output = $db->deleteSetting(
            $groupClass,
            $groupKey
        );
        break;
    default: // GET, etc
        if($rowIdList) {
            // Only row IDs with labels, used in Editor reference dropdowns.
            $output = $db->getRowIdsWithLabels($groupClass, $rowIdLabel);
        }
        elseif($rowIds && count($rowIds) > 0) {
            // Entries based on IDs
            $output = $db->getEntriesByIds($rowIds, $noData);
        }
        elseif(!$groupClass || str_contains($groupClass, '*')) {
            // Only classes with counts, used in Editor side menu.
            $output = $db->getClassesWithCounts($groupClass);
        }
        else {
            // Single entry or list, depending on if key is set.
            $output = $db->getEntries($groupClass, $groupKey, $noData);
        }
}

// Output
$db->output($output);