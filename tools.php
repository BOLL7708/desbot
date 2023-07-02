<?php
include_once '_init.php';
PageUtils::printTop(true, false);
?>
    <div id="content">
        <h2>Tools</h2>
        <ul>
            <li>Add Twitch user.</li>
            <li>Load missing data for all Twitch users.</li>
            <li>Add Steam game.</li>
            <li>Load missing data for all Steam games.</li>
            <li>Reload Philips Hue bulbs and plugs. <input class="main-button" type="button" id="philipsHueLights" value="Run"/></li>
            <li>Import rewards from Twitch (with options).</li>
        </ul>
        <div id="container"></div>
    </div>
    <script type="module" src="./dist/Pages/Tools/ToolsEmbed.js"></script>
<?php
PageUtils::printBottom();
?>