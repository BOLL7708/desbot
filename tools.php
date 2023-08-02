<?php
include_once '_init.php';
PageUtils::printTop(true, false);
?>
    <div id="content">
        <h2>Tools</h2>
        <ul id="toolsButtonList"></ul>
        <div id="toolsResult"></div>
    </div>
    <script type="module" src="./dist/Pages/Tools/ToolsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>