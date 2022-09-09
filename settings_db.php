<?php
include_once './init.php';
$db = DB::get();

// Parameters
$category = $_GET['category'] ?? null;
$subcategory = $_GET['subcategory'] ?? null;
$userId = $_GET['userId'] ?? null;
if(!$category) DBUtils::exitWithError('category was not supplied in request');

// Execute
$output = null;
switch($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $payload = file_get_contents('php://input');
        $output = $db->saveSetting(
            $category,
            $subcategory,
            intval($userId) ?? null,
            $payload
        );
        break;
    case 'PUT':
        $payload = file_get_contents('php://input');
        $output = $db->saveSetting(
            $category,
            $subcategory,
            intval($userId) ?? null,
            $payload,
            true
        );
        break;
    default:
        if($userId) {
            $output = $db->getSetting(
                $category,
                $subcategory,
                $userId
            );
        } else {
            $output = $db->getSettings(
                $category,
                $subcategory
            );
        }
        break;
}
if($_SERVER['REQUEST_METHOD'] === 'POST') {

} else {

}

// Output
header('Content-Type: application/json; charset=utf-8');
echo json_encode(
    is_bool($output)
        ? ['result'=>$output]
        : $output
);