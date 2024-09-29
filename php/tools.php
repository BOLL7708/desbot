<?php
include_once '_init.php';
PageUtils::printTop(true, false);
?>
    <div id="content">
        <h2>Tools</h2>
        <ul id="toolsButtonList" class="no-list"></ul>
        <div id="toolsResult"></div>
    </div>
    <script type="module" src="../bot/dist/Client/Pages/Tools/ToolsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>