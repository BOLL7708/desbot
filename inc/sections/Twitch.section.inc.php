<div id="sectionTwitchClient">
    <h2>Twitch Client</h2>
    <form id="formTwitchClient">
        <ol>
            <li><label>Copy the <i>redirect URI</i> from here: <input type="text" size="48" name="redirectUri"/></label></li>
            <li>Log into the <a href="https://dev.twitch.tv/console/apps/" target="_blank">Twitch Console</a> and create an application.</li>
            <li>Paste the <i>redirect URI</i> you copied into the corresponding field for your application.</li>
            <li><label>Copy the <i>Client ID</i> and paste into here: <input type="text" size="32" name="clientId"/></label></li>
            <li><label>Generate and copy the <i>Client Secret</i> and paste it into here: <input type="text" size="32" name="clientSecret"/></label></li>
            <li>Click this button to save your settings: <input type="submit" value="Save"/></li>
        </ol>
    </form>
</div>
<div id="sectionTwitchLoginChannel">
    <h2>Twitch Login</h2>
    <form id="formTwitchLoginChannel">
        <input type="hidden" name="state" value="Channel"/>
        <label>Sign in to your Twitch Channel account: </label><input type="submit" value="Launch Twitch Authentication"/>
    </form>
</div>
<div id="sectionTwitchLoginChatbot">
    <h2>Twitch Login</h2>
    <form id="formTwitchLoginChatbot">
        <input type="hidden" name="state" value="Chatbot"/>
        <label>Sign in to your Twitch Chatbot account: </label><input type="submit" value="Launch Twitch Authentication"/>
    </form>
</div>