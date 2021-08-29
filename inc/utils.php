<?php
function loadJSFiles() {

    function includeFile($root, $file, $directory) {
        $name = $file->getFilename();
        if(
            $file->getExtension() == 'js' 
            && strpos($name, 'template') === false
            && strpos($directory, 'interfaces') === false
        ) {
            if($directory) {
                echo '<script src="'.$root.$directory.'/'.$name.'?'.uniqid().'"></script>'."\n";
            } else {
                // echo '<script src="'.$root.$name.'?'.uniqid().'"></script>'."\n";
            }
        }
    }

    $root = './dist/';
    $dir = new DirectoryIterator($root);
    foreach ($dir as $file) {
        $name = $file->getFilename();
        if (
            $file->isDir() && 
            !$file->isDot() && 
            substr($name,0,1) != '.'
        ) {
            $dir2 = new DirectoryIterator($root.$name);
            foreach($dir2 as $file2) {
                includeFile($root, $file2, $name);
            }
        } else {
            includeFile($root, $file, null);
        }
    }

    // We want to embed config last so it can access constants in modules.
    echo '<script src="'.$root.'utils.js?'.uniqid().'"></script>'."\n";
    echo '<script src="'.$root.'main_controller.js?'.uniqid().'"></script>'."\n";
    echo '<script src="'.$root.'config.js?'.uniqid().'"></script>'."\n";
}