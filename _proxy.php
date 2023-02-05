<?php
ini_set('display_errors', 0);
$url = $_REQUEST['url'] ?? null;
if($url != null) {
	$ch = curl_init();
	$urlStr = base64_decode($url);
	// error_log($urlStr);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $urlStr);
	$data = curl_exec($ch);
	if($data != null) {
		echo $data;
	} else {
		http_response_code(404);
	}
} else {
	http_response_code(400);
}