<?php
function printMenuItem(string $thisScript, string $file, string $label, string $title, bool $blank=false): void {
    $newScript = explode('.', $file)[0];
    $isCurrent = $thisScript == $newScript ? 'class="menu-bar-current"' : '';
    $openInBlank = $blank ? 'target="_blank"' : '';
    echo "<li><a href=\"$file\" title=\"$title\" $isCurrent $openInBlank>$label</a></li>";
}
?>
<div id="menu-bar">
    <ul>
        <?php
        $scriptFile = Utils::getScriptFileName();
        printMenuItem($scriptFile,'index.php', '🧪 Setup', 'Run the setup which includes regular database migrations.');
        if($scriptFile !== 'index') {
            printMenuItem($scriptFile, 'settings.php', '📚 Settings', 'Browse, add, edit or delete settings.');
            printMenuItem($scriptFile, 'config.php', '🧩 Config', 'Browse, add, edit or delete configs.');
            printMenuItem($scriptFile, 'events.php', '🎉 Events', 'Browse, add, edit or delete events.');
            printMenuItem($scriptFile, 'dashboard.php', '🚦 Dashboard', 'Show the dashboard which lets you manage events and features live.');
            printMenuItem($scriptFile, 'widget.php', '🎭 Widget (new tab)', 'This opens the widget in a new tab, use this as a browser source in your streaming application.', true);
            printMenuItem($scriptFile, 'widget.php?debug=1', '🚧 Widget (+debug)', 'This opens the widget in a new tab with debugging turned on, which means some objects are available in the console.', true);
        } ?>
        <li><a href="index.php" id="topBarSignOutLink" title="Sign out of this page.">🔥 Sign out</a></li>
    </ul>
    <script type="module">
        import TopBar from './dist/Pages/TopBar.js'
        TopBar.attachSignOutClick('#topBarSignOutLink')
    </script>
</div>