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
    'twitch_rewards'=>'SettingTwitchReward',
    'event_counters_incremental'=>'SettingIncrementingCounter',
    'event_counters_accumulating'=>'SettingAccumulatingCounter',
    'twitch_reward_redemptions'=>'SettingTwitchRedemption',
    // 'twitch_credentials'=>'SettingTwitchCredentials',
    'twitch_user_cheers'=>'SettingTwitchSub',
    'twitch_user_subs'=>'SettingTwitchCheer',
    'steam_achievements'=>'SettingSteamAchievements'
];

// Includes
include_once('init.php');

// Go through settings files
$path1= './_settings';
$path2 = "$path1/steam_achievements";
$files1 = scandir($path1);
$files2 = scandir($path2);
$files = [];
foreach($files1 as $file) {
    $files[] = ["$path1/$file", $file];
}
foreach($files2 as $file) {
    $files[] = ["$path2/$file", $file];
}
$output = [];
foreach($files as $file) {
    $fileArr = explode('.', $file[1]);
    $fileName = array_shift($fileArr);
    $fileExt = array_pop($fileArr);
    $isSubfolder = false;
    $subfolderSetting = [];
    $subfolderKey = null;
    if(strtolower($fileExt ?? '') == 'csv') {
        if(str_contains($file[0], 'steam_achievements')) { // Handle sub-folder
            $isSubfolder = true;
            $subfolderKey = implode('.', explode('_', $fileName));
            $class = $classMap["steam_achievements"];
        } else {
            $class = $classMap[$fileName] ?? '';
        }
        if($class && file_exists($file[0])) {
            $contents = file_get_contents($file[0]);
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
                    $setting = new stdClass();
                }

                // Twitch Rewards & associated settings.
                $withKey = [
                    'SettingTwitchReward',
                    'SettingIncrementingCounter',
                    'SettingAccumulatingCounter'
                ];
                if(in_array($class, $withKey) && key_exists('key', $setting)) {
                    $key = $setting['key'];
                    unset($setting['key']);
                }

                // Steam Achievements
                if($class === 'SettingSteamAchievements' && key_exists('key', $setting)) {
                    $key = $setting['key'];
                    $state = $setting['state'];
                    if(intval($state) > 0) $subfolderSetting[] = $key;
                    continue;
                }

                // Trophies
                if($class === 'SettingChannelTrophyStat' && key_exists('cost', $setting)) {
                    $key = $setting['cost'];
                    unset($setting['cost']);
                }

                saveSettingAndBuildOutput($class, $key, $setting, $output);
            }
            if($isSubfolder && !empty($subfolderSetting) && $subfolderKey !== null) {
                saveSettingAndBuildOutput($class, $subfolderKey, ['achieved'=>$subfolderSetting], $output);
            }
        }
    }
}
function saveSettingAndBuildOutput($class, $key, $setting, &$output) {
    $db = DB::get();
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

Utils::outputJson($output);