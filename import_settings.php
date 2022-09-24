<?php
// Map file names to classes as that is what we're using in the database.
$classMap = [
    'channel_trophy_stats'=>'SettingChannelTrophyStat',
    'stream_quotes'=>'SettingStreamQuote',
    'tts_blacklist'=>'SettingUserMute',
    'tts_dictionary'=>'SettingDictionaryEntry',
    'tts_names'=>'SettingUserName',
    'tts_voices'=>'SettingUserVoice',
    'twitch_clips'=>'SettingTwitchClip',
    'twitch_rewards'=>'SettingTwitchRewardPair',
    'event_counters_incremental'=>'SettingIncrementingCounter',
    'event_counters_accumulating'=>'SettingAccumulatingCounter',
    'twitch_reward_redemptions'=>'SettingTwitchRedemption',
    // 'twitch_credentials'=>'SettingTwitchCredentials',
    'twitch_user_cheers'=>'SettingTwitchSub',
    'twitch_user_subs'=>'SettingTwitchCheer'
];

// Includes
include_once('init.php');
$db = DB::get();

// Go through settings files
$path = './_settings';
$files = scandir($path);
$output = [];
foreach($files as $file) {
    $fileArr = explode('.', $file);
    $fileName = array_shift($fileArr);
    $fileExt = array_pop($fileArr);
    if(strtolower($fileExt ?? '') == 'csv') {
        $class = $classMap[$fileName] ?? '';
        if($class) {
            $contents = file_get_contents("$path/$file");
            $rows = explode("\n", $contents);
            foreach($rows as $row) {
                $pairs = explode(';', $row);
                $setting = [];
                foreach($pairs as $pair) {
                    $values = explode('|', $pair);
                    if (count($values) == 2) {
                        // Parse out actual values
                        $field = $values[0];
                        $value = $values[1];
                        if ($class == 'SettingUserMute' && $field == 'active') { // This is a blacklist bool, empty string or string '1', handle specifically.
                            $value = boolval($value);
                        } else {
                            $value = is_numeric($value)
                                ? intval($value)
                                : (is_bool($value)
                                    ? boolval($value)
                                    : $value);
                        }
                        if (!is_string($value) || !empty($value)) $setting[$values[0]] = $value;
                    }
                }

                // Moves username from TTS Voices and TTS Names to the key.
                $key = null;
                if(key_exists('userName', $setting)) {
                    $key = Twitch::getIdFromLogin($setting['userName']);
                    unset($setting['userName']);
                }

                // Editor in Dictionary Entries and TTS Names
                if(key_exists('editor', $setting)) {
                    $userId = Twitch::getIdFromLogin($setting['editor']);
                    unset($setting['editor']);
                    $setting['editorUserId'] = $userId;
                }

                // Author and submitter for quotes
                if(key_exists('author', $setting)) {
                    $userId = Twitch::getIdFromLogin($setting['author']);
                    unset($setting['author']);
                    $setting['quoteeUserId'] = $userId;
                }
                if(key_exists('submitter', $setting)) {
                    $userId = Twitch::getIdFromLogin($setting['submitter']);
                    unset($setting['submitter']);
                    $setting['quoterUserId'] = $userId;
                }
                if($class === 'SettingDictionaryEntry' && key_exists('original', $setting)) {
                    $key = $setting['original'];
                    unset($setting['original']);
                }

                // Twitch Redemptions
                if(key_exists('redemptionId', $setting)) {
                    $key = $setting['redemptionId'];
                    unset($setting['redemptionId']);
                }

                // Twitch Clips
                if($class === 'SettingTwitchClip' && key_exists('id', $setting)) {
                    $key = $setting['id'];
                    unset($setting['id']);
                }

                // Twitch Rewards & associated settings.
                $withKey = [
                    'SettingTwitchRewardPair',
                    'SettingIncrementingCounter',
                    'SettingAccumulatingCounter'
                ];
                if(in_array($class, $withKey) && key_exists('key', $setting)) {
                    $key = $setting['key'];
                    unset($setting['key']);
                }

                // Trophies
                if($class === 'SettingChannelTrophyStat' && key_exists('cost', $setting)) {
                    $key = $setting['cost'];
                    unset($setting['cost']);
                }

                if(count($setting) === 0) $setting = null;
                if($setting === null && $key === null) continue; // Skip entirely empty entries, generated by empty lines in settings files.

                $result = $db->saveSetting($class, $key, json_encode($setting));
                $classOkay = "$class(OKAY)";
                $classFail = "$class(FAIL)";
                if($result) {
                    if(!array_key_exists($classOkay, $output)) $output[$classOkay] = 0;
                    $output[$classOkay]++;
                } else {
                    if(!array_key_exists($classFail, $output)) $output[$classFail] = 0;
                    $output[$classFail]++;
                }
            }
        }
    }
}
Utils::outputJson($output);