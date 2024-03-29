<?php
// Init
include_once '_init.php';
$db = DB_SQLite::get();

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
$groupKey = getHeaderValue('X-Group-Key');
$rowIds = array_filter(explode(',', getHeaderValue('X-Row-Ids') ?? ''));
$dataJson = file_get_contents('php://input'); // Raw JSON as a string.
$newGroupKey = getHeaderValue('X-New-Group-Key');
$rowIdList = !!getHeaderValue('X-Row-Id-List');
$rowIdLabel = getHeaderValue('X-Row-Id-Label');
$noData = !!getHeaderValue('X-No-Data');
$parentId = getHeaderValue('X-Parent-Id', true);
$searchQuery = getHeaderValue('X-Search-Query');
$nextGroupKey = !!getHeaderValue('X-Next-Group-Key');
$onlyId = !!getHeaderValue('X-Only-Id');
$deleteCategory = getHeaderValue('X-Delete-Category');

if($parentId == 0) $parentId = null;

// Execute
$output = null;
switch($method) {
    case 'post':
        if($groupClass) {
            // Update key
            $updatedKey = false;
            if($groupKey !== null && $newGroupKey !== null) { // Try to edit key
                $updatedKey = $db->updateKey($groupClass, $groupKey, $newGroupKey);
                $groupKey = $newGroupKey;
            }
            if($groupKey === null && $newGroupKey !== null) { // New key
                $groupKey = $newGroupKey;
            }

            // Insert or update
            $result = $db->saveEntry(
                $groupClass,
                $groupKey,
                $parentId,
                $dataJson
            );
            $output = $result !== false ? ['result'=>true, 'groupKey'=>$result] : false;
        }
        break;
    case 'delete':
        if($deleteCategory) {
            $output = $db->deleteCategory($deleteCategory);
        }
        else if($groupClass) {
            // Delete (single or all keys in group
            $output = $db->deleteSetting(
                $groupClass,
                $groupKey
            );
        }
        break;
    default: // GET, etc
        if($nextGroupKey) {
            $output = $db->getNextKey($groupClass, $groupKey);
        }
        elseif($searchQuery !== null) {
            // Search
            $output = $db->search($searchQuery);
        }
        elseIf($onlyId) {
            // Only get ID for a row
            $output = $db->getEntryId($groupClass, $groupKey);
        }
        elseif($rowIdList) {
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
            // Single entry or list, depending on if key is set.
            $output = $db->getEntries($groupClass, $groupKey, $parentId, $noData);
        }
}

// Output
$db->output($output);