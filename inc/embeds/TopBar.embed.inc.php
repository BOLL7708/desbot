<div id="menu-bar">
    <ul>
        <li><a href="index.php">🧪 Setup</a></li>
        <?php
        $scriptFile = Utils::getScriptFileName();
        if($scriptFile !== 'index') {
        ?>
        <li><a href="editor.php">🎨 Editor</a></li>
        <li><a href="dashboard.php">🚦 Dashboard</a></li>
        <li><a href="widget.php" target="_blank">🎭 Widget (new tab)</a></li>
        <li><a href="index.php" id="topBarSignOutLink">🔥 Sign out</a></li>
        <?php } ?>
    </ul>
    <script type="module">
        import TopBar from './dist/Pages/TopBar.js'
        TopBar.attachSignOutClick()
    </script>
</div>