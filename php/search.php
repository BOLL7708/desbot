<?php
include_once '_init.php';
PageUtils::printTop(true, false);
?>
    <div id="content">
        <h2>Search</h2>
        <p><label for="search">Query:</label><input name="search" type="search" id="search" title="Wildcards: ? = single, * = many" size="32"/></p>
        <div id="container"></div>
    </div>
    <script type="module" src="../bot/dist/Client/Pages/Search/SearchEmbed.js"></script>
<?php
PageUtils::printBottom();
?>