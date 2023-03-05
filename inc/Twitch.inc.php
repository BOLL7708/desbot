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
        $json = $jsonStr ? json_decode($jsonStr) : null;
        $id = intval($json?->data[0]?->id ?? '');
        self::$_userCache[$login] = $id;
        return $id;
    }

    static private function loadPage(string $url): string
    {
        $twitchClientData = DB::get()->getEntries('SettingTwitchClient', 'Main');
        $clientId = $twitchClientData[0]->data->clientId ?? null;

        $tokenData = DB::get()->getEntries('SettingTwitchTokens', 'Channel');
        $accessToken = $tokenData[0]->data->accessToken ?? null;
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