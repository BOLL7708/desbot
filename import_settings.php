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

echo "<pre>";

// Go through settings files
$path = './_settings';
$files = scandir($path);
foreach($files as $file) {
    $fileArr = explode('.', $file);
    $fileName = array_shift($fileArr);
    $fileExt = array_pop($fileArr);
    if(strtolower($fileExt) == 'csv') {
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
                // TODO: Add more userName conversions here.
                $userId = null;
                if(key_exists('userName', $setting)) {
                    $userId = Twitch::getIdFromLogin($setting['userName']);
                    unset($setting['userName']);
                }
                $result = $db->saveSetting($class, $userId, json_encode($setting));
                $count = count($pairs);
                echo $result
                    ? "Imported <u>$class</u> row, $count value(s).\n"
                    : "<strong>Failed to import <u>$class</u> row.</strong>\n";
            }
        }
    }
}