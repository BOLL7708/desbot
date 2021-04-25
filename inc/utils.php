<?php
function loadJSFiles() {
    $root = './dist/';
    $dir = new DirectoryIterator($root);
    foreach ($dir as $file) {
        $dirName = $file->getFilename();
        if (
            $file->isDir() && 
            !$file->isDot() && 
            substr($dirName,0,1) != '.'
        ) {
            $dir2 = new DirectoryIterator($root.$dirName);
            foreach($dir2 as $file2) {
                if($file2->getExtension() == 'js') {
                    echo '<script src="'.$root.$dirName.'/'.$file2->getFilename().'?'.uniqid().'"></script>'."\n";
                }
            }
        } else {
            if($file->getExtension() == 'js') {
                echo '<script src="'.$root.$file->getFilename().'?'.uniqid().'"></script>'."\n";
            }
        }
    }
}