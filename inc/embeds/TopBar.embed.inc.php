<?php
function printMenuItem(string $thisScript, $newGroup, string $file, string $label, string $title, bool $blank=false): void {
    $thisGroup = Utils::getQueryParams($file)['g'] ?? '';
    $newScript = explode('.', $file)[0];
    $isCurrent = (
            $thisScript == $newScript
            && $thisGroup == $newGroup
    ) ? 'class="menu-bar-current"' : '';
    $openInBlank = $blank ? 'target="_blank"' : '';
    echo "<li><a href=\"$file\" title=\"$title\" $isCurrent $openInBlank>$label</a></li>";
}
?>
<div id="menu-bar">
    <ul>
        <?php
        $scriptFile = Utils::getScriptFileName();
        $group = Utils::getQueryParams()['g'] ?? '';
        printMenuItem($scriptFile,$group, 'index.php', '🧪 Setup', 'Run the setup which includes regular database migrations.');
        if($scriptFile !== 'index') {
            printMenuItem($scriptFile, $group, 'editor.php?g=c', '🎨 Config', 'Browse, add, edit or delete configs.');
            printMenuItem($scriptFile, $group, 'editor.php?g=p', '🧩 Presets', 'Browse, add, edit or delete presets.');
            printMenuItem($scriptFile, $group, 'editor.php?g=e', '🎉 Events', 'Browse, add, edit or delete events.');
            printMenuItem($scriptFile, $group, 'editor.php?g=t', '⏰ Triggers', 'Browse, add, edit or delete triggers.');
            printMenuItem($scriptFile, $group, 'editor.php?g=a', '🤹 Actions', 'Browse, add, edit or delete actions.');
            printMenuItem($scriptFile, $group, 'editor.php?g=s', '📚 Settings', 'Browse, add, edit or delete settings.');
            printMenuItem($scriptFile, $group, 'dashboard.php', '🚦 Dashboard', 'Show the dashboard which lets you manage events and features live.');
            printMenuItem($scriptFile, $group, 'widget.php', '🎭 Widget (new tab)', 'This opens the widget in a new tab, use this as a browser source in your streaming application.', true);
            printMenuItem($scriptFile, $group, 'widget.php?debug=1', '🚧 Widget (+debug)', 'This opens the widget in a new tab with debugging turned on, which means some objects are available in the console.', true);
        } ?>
        <li><a href="index.php" id="topBarSignOutLink" title="Sign out of this page.">🔥 Sign out</a></li>
    </ul>
    <script type="module">
        import TopBar from './dist/Pages/TopBar.js'
        TopBar.attachSignOutClick('#topBarSignOutLink')
    </script>
</div>