<?php
include_once '_init.php';
PageUtils::printTop(true, false);
?>
    <div id="content">
        <h2>Defaults</h2>
        <p>This lets you import default entries into the database that will create for a good base for a widget setup.</p>
        <div id="defaults-container"></div>
    </div>
    <script type="module" src="../bot/dist/Client/Pages/Defaults/DefaultsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>