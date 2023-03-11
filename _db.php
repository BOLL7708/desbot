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

function getHeaderValue(string $field, bool $asInt = false): int|string|null {
    $headers = getallheaders();
    $value = $headers[$field] ?? $headers[strtolower($field)] ?? null;
    if($value === null) return null;
    if($asInt) return intval($value);
    return $value;
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
$parentId = getHeaderValue('X-Parent-Id', true);
if($parentId == 0) $parentId = null;

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
            $parentId,
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
            $output = $db->getRowIdsWithLabels($groupClass, $rowIdLabel, $parentId);
        }
        elseif($rowIds && count($rowIds) > 0) {
            // Entries based on IDs
            $output = $db->getEntriesByIds($rowIds, $parentId, $noData);
        }
        elseif(!$groupClass || str_contains($groupClass, '*')) {
            // Only classes with counts, used in Editor side menu.
            $output = $db->getClassesWithCounts($groupClass, $parentId);
        }
        else {
            error_log(json_encode([$groupClass, $groupKey, $parentId, $noData]));
            // Single entry or list, depending on if key is set.
            $output = $db->getEntries($groupClass, $groupKey, $parentId, $noData);
        }
}

// Output
$db->output($output);