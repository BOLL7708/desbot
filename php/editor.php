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
    'c'=>'<p>This is the place for persistent configuration, manually configured by you.</p>
<p>Access any of the configs stored in the database from the list to the left.</p>',
    'p'=>'<p>Presets are reusable and referenced elsewhere, or in some cases used because they would be too big to keep in an already complex object.</p>',
    'e'=>'<p>These are the main items of the widget, what connects triggers to actions, and specifies special behavior for rewards.</p>',
    't'=>'<p>Triggers are listeners that will cause a set of actions to run when activated. Triggers can either be registered globally right here, or they can be created as a child to an event.</p>
<p>Child triggers will only appear in lists for their parent, global triggers will show up for any location, unless that is turned off in the editor settings.</p>',
    'a'=>'<p>Actions are tasks that run when activated my triggers, they can cause all kinds of effects. Actions can either be registered globally right here, or they can be created as a child to an event by adding them to the event while editing that.</p>
<p>Child actions will only appear in lists for their parent, global actions will show up for any location, unless that is turned off in the editor settings.</p>',
    's'=>'<p>Settings are values automatically added and updated by the system itself, so this page exists mostly for manual inspection and to resolve issues with faulty data.</p>'
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