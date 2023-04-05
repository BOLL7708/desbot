<?php
$group = $_REQUEST['g'] ?? '';
$minimal = !!($_REQUEST['m'] ?? '');

$validGroups = [
    'c'=>'Configs',
    'p'=>'Presets',
    'e'=>'Events',
    't'=>'Triggers',
    'a'=>'Actions',
    's'=>'Settings'
];
$descriptions = [
    'c'=>'<p>The plan is for this to be the main place for setting up the widget, there is a lot of features to add before this will be possible though.</p>
<p>Access any of the configs stored in the database from the list to the left.</p>',
    'p'=>'<p>Presets are things we want to reuse, or just things too big to keep in an already complex object.</p>',
    'e'=>'<p>These are the main items of the widget, what connects triggers to actions, and specifies special behavior for rewards. The nexus root is here.</p>',
    't'=>'<p>Triggers are listeners that will cause a set of actions to run when activated. Triggers can either be registered globally right here, or they can be created as a child to an event by adding them to the event while editing that.</p>
<p>Child triggers will only appear in lists for their parent, global triggers will show up for any location, unless turned off in the editor settings.</p>',
    'a'=>'<p>Actions are tasks that run when activated my triggers, they can cause all kinds of effects. Actions can either be registered globally right here, or they can be created as a child to an event by adding them to the event while editing that.</p>
<p>Child actions will only appear in lists for their parent, global actions will show up for any location, unless turned off in the editor settings.</p>',
    's'=>'<p>This page exists for when there are issues, as an easy way to inspect and correct eventual faulty data.</p>
<p>Settings are values that are automatically stored, accessed and updated by various systems in the widget, and should in general not have to be touched by a human.</p>
<p>To use this, access any of the settings stored in the database from the list to the left.</p>',
];

$title = 'Editor';
$description = 'Please chose a type of items to edit.';

if(array_key_exists($group, $validGroups)) {
    $title = $validGroups[$group];
    $description = $descriptions[$group];
}
include_once '_init.php';
PageUtils::printTop(!$minimal, !$minimal);
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