<?php
/**
 * Documentation: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow
 */
error_reporting(E_STRICT);
include_once('inc/Utils.inc.php');
include_once('inc/Settings.inc.php');
$config = include_once('_configs/config.php');
$pageUrl = 'http'
    .((!empty($_SERVER['HTTPS'] ?? '')) ? 's' : '')
    .'://'
    .$_SERVER['HTTP_HOST']
    .$_SERVER['REQUEST_URI'];
$pageUrlArr = explode('?', $pageUrl);
$redirectUri = array_shift($pageUrlArr);
$missing = $_REQUEST['missing'] ?? '';
$missingName = $_REQUEST['missingName'] ?? '';

$scopes = [
    "bits:read",
    "chat:read",
    "chat:edit",
    "whispers:read",
    "whispers:edit",
    "channel:read:redemptions",
    "channel:read:subscriptions",
    "channel:manage:redemptions",
    "channel:manage:broadcast",
    "channel:manage:raids"
];

$code = $_REQUEST['code'] ?? '';
$scope = $_REQUEST['scope'] ?? '';
$state = $_REQUEST['state'] ?? '';
$gotAuthResponse = !empty($code) && !empty($scope) && !empty($state);
?>
<!DOCTYPE html>
<html>
    <head>
        <title>
            Streaming Widget Login
        </title>
        <style>
            body {
                font-family: sans-serif;
                background-image: linear-gradient(135deg, rgba(255,215,0,1) 0%, rgba(255,55,0,1) 100%);
                background-repeat: no-repeat;
                background-attachment: fixed;
            }
            .container {
                margin: 2rem auto;
                max-width: 32rem;
                padding: 0.25rem 1rem;
                background-color: white;
                border-radius: 1.5rem;
                box-shadow: 0 8px 8px 0 #0004;
            }
            hr {
                margin: 1.5rem 0;
                border: 1px solid black;
            }
            div {
                padding: 0.25rem;
                line-height: 125%;
            }
            a {
                font-weight: bold;
            }
            li {
                padding: 0.25rem;
            }
            .center {
                margin-left: auto;
                margin-right: auto;
                text-align: center;
            }
            input[type=text], select {
                border-radius: 0.25rem;
                border: 1px solid #ccc;
                background-color: #fafafa;
                padding: 0.25rem;
            }
            input[type=submit] {
                background-image: linear-gradient(135deg, rgba(215,255,0,1) 0%, rgba(55,255,0,1) 100%);
                margin: 1rem;
                padding: 0.5rem;
                border-radius: 100rem;
                border: none;
                font-weight: bold;
                color: darkred;
                box-shadow: 0 4px 4px 0 #0004, inset 0 2px 8px 0 #0004;
                transition: all 0.15s ease-in-out;
            }
            input[type=submit]:hover {
                color: brown;
                box-shadow: 0 6px 6px 0 #0002, inset 0 2px 8px 0 #0002;
            }
            input[type=submit]:active {
                transform: translateY(0.125rem);
                box-shadow: 0 0 4px 0 #0004, inset 0 2px 8px 0 #0004;
            }
            .code {
                font-size: 0.8rem;
                font-family: monospace;
                background-color: lightgoldenrodyellow;
                border-radius: 0.25rem;
                border: 1px solid goldenrod;
                padding: 0 0.25rem;
                white-space: nowrap;
            }
            .profileImg {
                margin: auto;
                width: 10rem;
                height: 10rem;
                border: 0.25rem solid white;
                border-radius: 1rem;
                box-shadow: 0 4px 4px 0 #0004, inset 0 2px 8px 0 #0004;
                background-size: cover;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="center">Streaming Widget Login</h1>
            <hr/>
            <?php 
            /**
             * Check if we have a response, if not, show the initial form.
             */
            if(!$gotAuthResponse) { 
                if(!empty($missing) && !empty($missingName)) {
                    ?>
                    <h2>What is this?</h2>
                    <p>The Streaming Widget needs tokens to connect to Twitch stuff, one or more are missing, this page will help you get them, might appear multiple times.</p>
                    <p>Right now we want tokens for the <strong><?=$missing?></strong>, please follow the instructions below and then sign in with:</p>
                    <h1 class="center"><?=strtoupper($missingName)?></strong></h1>
                    <hr/>
                    <?php
                }
            ?>
            <h2>One-Time Preparation</h2>
            <ol>
                <li>Go to the <a href="https://dev.twitch.tv/console/apps/" target="_blank">Twitch Console</a> and create or reuse an old application.</li>
                <li>On that page, save the <span class="code">Client ID</span> and <span class="code">Client Secret</span>, and then put those into the appropriate fields in <span class="code">./_configs/config.php</span>.</li>
                <li><a href="<?=$pageUrl?>">Reload</a> this page, and the <span class="code">Twitch Client ID</span> below should now be filled in.</li>
                <li>On this page, copy the <span class="code">Redirect URI</span> value below, then go back to your application on the <span class="code">Twitch Console</span> page and add it to <span class="code">OAuth Redirect URLs</span>, make sure to save.</li>
                <li>Now everything should be set to request tokens, press the <span class="code">Launch Authentication</span> button at the bottom of the form.</li>
            </ol>
            <hr/>
            <h2>Twitch Authentication</h2>
            <form method="GET" action="https://id.twitch.tv/oauth2/authorize">
                <p>If both fields below are filled in, and you followed the steps above, this form should allow you to retrieve Twitch tokens.</p>
                
                <div>
                    <label for="client_id">Twitch Client ID:</label>
                    <input type="text" name="client_id" size=32 value="<?=$config->twitchClientId?>"/>
                </div>

                <div>
                    <label for="redirect_uri">Redirect URI:</label>
                    <input type="text" name="redirect_uri" size=48 value="<?=$redirectUri?>"/>
                </div>

                <input type="hidden" name="force_verify" value="true"/>
                <input type="hidden" name="response_type" value="code"/>
                <input type="hidden" name="scope" value="<?=implode(" ", $scopes)?>"/>
                <input type="hidden" name="state" value="<?=rand(0, 1000000)?>"/>

                <div class="center">
                    <input type="submit" value="Launch Twitch Authentication"/>
                </div>
            </form>
            <?php } else { 
                /**
                 * We got a response so we are retrieving tokens.
                 */
                $result = Utils::postForm('https://id.twitch.tv/oauth2/token', [
                    'client_id' => $config->twitchClientId,
                    'client_secret' => $config->twitchClientSecret,
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => $redirectUri
                ]);
                $json = json_decode($result);
                if($result && $json) {
                    // Get user info so we know who to save tokens for.
                    $userInfoArr = json_decode(Utils::get('https://api.twitch.tv/helix/users', [
                        "Authorization: Bearer {$json->access_token}",
                        "Client-Id: {$config->twitchClientId}"
                    ]));
                    $userInfo = $userInfoArr->data[0] ?? (object) [];
                    if($userInfo) {
                        $settingsFile = Settings::getFilePath('twitch_credentials', '', 'csv');
                        $settings = Settings::readSettings($settingsFile) ?? [];
                        $done = false;
                        foreach($settings as $key => $value) {
                            if($value['userName'] == $userInfo->login) {
                                $value['accessToken'] = $json->access_token;
                                $value['refreshToken'] = $json->refresh_token;
                                $value['updated'] = date("Y-m-d H:i:s");
                                $value['clientId'] = $config->twitchClientId;
                                $value['clientSecret'] = $config->twitchClientSecret;
                                $settings[$key] = $value;
                                $done = true;
                            }
                        }
                        if(!$done) {
                            $settings[] = [
                                'userName' => $userInfo->login,
                                'accessToken' => $json->access_token,
                                'refreshToken' => $json->refresh_token,
                                'updated' => date("Y-m-d H:i:s"),
                                'clientId' => $config->twitchClientId,
                                'clientSecret' => $config->twitchClientSecret
                            ];
                        }
                        $success = Settings::writeSettings($settingsFile, $settings);
                        if($success) {
                            ?>
                            <div class="center">
                                <div class="profileImg" style="background-image: url(<?=$userInfo->profile_image_url?>);"></div>
                                <p>Tokens successfully saved for <?=$userInfo->display_name?>!</p>
                                <p>Go back to the <a href="widget.php">Streaming Widget</a>.</p>
                            </div>
                            <?php
                        } else {
                            ?>
                            <div class="center">
                                <p>Tokens <?=$userInfo->display_name?> failed to save, please <a href="<?=basename(__FILE__)?>">try again</a>.</p>
                            </div>
                            <?php
                        }
                    } else { ?>
                        <div>
                            <p>Unable to load user info, access token faulty? Please <a href="<?=basename(__FILE__)?>">try again</a>.</p>
                        </div>
                        <?php 
                    }
                } else { ?>
                    <div>
                        <p>Could not get authentication data, please <a href="<?=basename(__FILE__)?>">try again</a>.</p>
                    </div>
                    <?php 
                }
            } ?>
        </div>
    </body>
</html>
