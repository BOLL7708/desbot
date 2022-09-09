<?php
include_once './init.php';
/*
1. Check if the database exists and has a version in it, if so use it as the current version.
    a. If not, assume the current version is 0.
2. Check for .sql files in the migrations folder that have names higher than the current version.
    a. Execute all migrations.
    b. Set the current version to the git commit count.
*/
$version = exec('git rev-list --count master');


