<!DOCTYPE html>
<html lang="en">
<body>
<?php
include_once('_init.php');

// Error TODO: Do something with these later?
$missing = $_REQUEST['missing'] ?? '';
$missingName = $_REQUEST['missingName'] ?? '';

$code = $_REQUEST['code'] ?? '';
$scope = $_REQUEST['scope'] ?? '';
$state = $_REQUEST['state'] ?? '';
$gotAuthResponse = !empty($code) && !empty($scope) && !empty($state);
$scopes = json_decode(file_get_contents("../app/htdocs/twitch_scopes.json")) ?? [];

function getAuthUrl():string {
    global $scopes, $state;
    $db = DB_SQLite::get();
    $twitchClient = $db->getEntries('SettingTwitchClient', 'Main');
    $config = $twitchClient[0]->data;
    $parts = [
        'https://id.twitch.tv/oauth2/authorize',
        "?client_id=$config->clientId",
        "&redirect_uri=$config->redirectUri",
        '&force_verify=true',
        '&response_type=code',
        '&scope='.implode(" ", $scopes),
        "&state=$state"
    ];
    return implode('', $parts);
}

if(!$gotAuthResponse) { ?>
    <script>
        window.onload = ()=>{
            window.location.assign('<?=getAuthUrl()?>')
        }
    </script>
<?php } else {
    /**
     * We got a response so we are retrieving tokens.
     */
    $db = DB_SQLite::get();
    $twitchClient = $db->getEntries('SettingTwitchClient', 'Main');
    $config = $twitchClient[0]->data;
    $result = Utils::postForm('https://id.twitch.tv/oauth2/token', [
        'client_id' => $config->clientId,
        'client_secret' => $config->clientSecret,
        'code' => $code,
        'grant_type' => 'authorization_code',
        'redirect_uri' => $config->redirectUri
    ]);
    $json = json_decode($result);
    $success = false;
    if($result && $json) {
        // Get user info so we know who to save tokens for.
        $userInfoArr = json_decode(Utils::get('https://api.twitch.tv/helix/users', [
            "Authorization: Bearer {$json->access_token}",
            "Client-Id: {$config->clientId}"
        ]));
        $userInfo = $userInfoArr->data[0] ?? (object) [];
        if($userInfo) {
            $success = $db->saveEntry('SettingTwitchTokens', $state, null, json_encode([
                'userId' => intval($userInfo->id),
                'userLogin' => $userInfo->login,
                'accessToken' => $json->access_token,
                'refreshToken' => $json->refresh_token,
                'scopes' => implode(" ", $scopes)
            ]));
        }
    }
    ?>
    <script>
        window.onload = ()=>{
            window.opener.postMessage('<?=$success ? $userInfo->id : ''?>', '*')
            window.close()
        }
    </script>
<?php
}
?>
</body>
</html>
