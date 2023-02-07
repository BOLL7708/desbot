<?php
$group = $_REQUEST['g'] ?? '';
$validGroups = ['s'=>'Settings', 'c'=>'Configs', 'p'=>'Presets', 'e'=>'Events'];
$descriptions = [
    's'=>'<p>This page exists for when there are issues, as an easy way to inspect and correct eventual faulty data.</p>
<p>Settings are values that are automatically stored, accessed and updated by various systems in the widget, and should in general not have to be touched by a human.</p>
<p>To use this, access any of the settings stored in the database from the list to the left.</p>',
    'c'=>'<p>The plan is for this to be the main place for setting up the widget, there is a lot of features to add before this will be possible though.</p>
<p>Access any of the configs stored in the database from the list to the left.</p>',
    'p'=>'<p>Presets are things we want to reuse, or just things too big to keep in an already complex object.</p>',
    'e'=>'<p>Eventually this will contain the event configs which are now the main motherload of crazy garbagea in the widget.</p>'
];

$title = 'Editor';
$description = 'Please chose a type of items to edit.';

if(array_key_exists($group, $validGroups)) {
    $title = $validGroups[$group];
    $description = $descriptions[$group];
}
include_once '_init.php';
PageUtils::printTop();
?>
        <div id="content">
            <h2><?=$title?></h2>
            <?=$description?>
            <?php Utils::includeFolder('./inc/embeds/editor')?>
        </div>
        <script type="module" src="./dist/Pages/Editor/EditorEmbed.js"></script>
<?php
PageUtils::printBottom();
?>