<?php return trim(shell_exec("git describe --tags --abbrev=0") ?? 'N/A'); // Gets the latest tag on the project, which should be a version number.