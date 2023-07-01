<?php
include_once '_init.php';
PageUtils::printTop();
?>
    <div id="content">
        <h2>Help</h2>
        <p>A lot of help stuff will be here.</p>
        <h3>Menu</h3>
        <ul>
            <li><strong>Setup</strong>: This is what runs first, and it will let you create a login, create a database and run migrations, set up your Twitch accounts.</li>
            <li><strong>Config</strong>: These are objects with system wide options, stuff that will most likely not change at runtime.</li>
            <li>...</li>
            <li><strong>Search</strong>: This is where you can search for things, it is very bare-bones as it was added just to exist in case of need.</li>
        </ul>
    </div>

<?php
PageUtils::printBottom();
?>