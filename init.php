<?php
spl_autoload_register(function ($class_name) {
    $cname = strtolower($class_name);
    include_once "./inc/$cname.inc.php";
});