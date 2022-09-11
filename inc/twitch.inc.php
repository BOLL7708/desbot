<?php

class Twitch {
    static private string $_baseUrl = 'https://api.twitch.tv/helix';
    static private array $_userCache = [];

    static function getIdFromLogin(string $login): int {
        $login = strtolower($login);
        if(array_key_exists($login, self::$_userCache)) {
            return self::$_userCache[$login];
        }
        $jsonStr = self::loadPage(self::$_baseUrl."/users/?login=$login");
        $json = json_decode($jsonStr);
        $id = intval($json?->data[0]?->id ?? '');
        self::$_userCache[$login] = $id;
        return $id;
    }

    static private function loadPage(string $url): string
    {
        $config = Config::get();
        $clientId = $config->twitchClientId;

        $accessTokensData = DB::get()->getSettings('SettingTwitchCredentials');
        error_log(json_encode($accessTokensData)); // TODO: Get access token from this.
        $accessToken = ''; // TODO: Needs to have been set by the login form before this!
        if(empty($accessToken)) exit;
        $context = stream_context_create(
            ['http' => [
                'header' => [
                    "Authorization: Bearer $accessToken",
                    "client-id: $clientId"
                ]
            ]]
        );
        return file_get_contents($url, false, $context);
    }
}