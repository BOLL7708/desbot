<?php
include_once './init.php';

/**
 * This returns the current count of commits on the master branch,
 * we use this to track which SQL dumps to run since the last update.
 */
$version = exec('git rev-list --count master');
Utils::outputJson(['current'=>$version]);