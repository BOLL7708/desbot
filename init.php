<?php
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.
spl_autoload_register(function ($class_name) {
    include_once "./inc/$class_name.inc.php";
});