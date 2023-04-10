-- This will combine old user-related data objects into one data object per user, which we can expand in the future.

-- Create new user objects which we will fill with data from old objects.
INSERT IGNORE INTO json_store (group_class, group_key, data_json)
    SELECT 'SettingUser', group_key, '{"voice":{},"name":{},"mute":{}}'
    FROM `json_store`
    WHERE
        group_class = 'SettingUserVoice'
        OR group_class = 'SettingUserName'
        OR group_class = 'SettingUserMute'
        OR group_class = 'SettingTwitchCheer'
        OR group_class = 'SettingTwitchSub'
    GROUP BY group_key;

-- Migrate data from old objects into the new ones we just created.

-- Voice
UPDATE json_store js1
    JOIN json_store js2 ON
                js1.group_class = 'SettingUserVoice'
            AND js1.group_key = js2.group_key
            AND js2.group_class = 'SettingUser'
SET js2.data_json = JSON_SET(
        js2.data_json,
        '$.voice.languageCode',
        JSON_EXTRACT(js1.data_json, '$.languageCode'),
        '$.voice.voiceName',
        JSON_EXTRACT(js1.data_json, '$.voiceName'),
        '$.voice.gender',
        JSON_EXTRACT(js1.data_json, '$.gender')
    )
WHERE js1.group_class = 'SettingUserVoice';

-- Name
UPDATE json_store js1
    JOIN json_store js2 ON
                js1.group_class = 'SettingUserName'
            AND js1.group_key = js2.group_key
            AND js2.group_class = 'SettingUser'
SET js2.data_json = JSON_SET(
        js2.data_json,
        '$.name.shortName',
        JSON_EXTRACT(js1.data_json, '$.shortName'),
        '$.name.editorUserId',
        JSON_EXTRACT(js1.data_json, '$.editorUserId'),
        '$.name.datetime',
        JSON_EXTRACT(js1.data_json, '$.datetime')
    )
WHERE js1.group_class = 'SettingUserName';

-- Mute
UPDATE json_store js1
    JOIN json_store js2 ON
                js1.group_class = 'SettingUserMute'
            AND js1.group_key = js2.group_key
            AND js2.group_class = 'SettingUser'
SET js2.data_json = JSON_SET(
        js2.data_json,
        '$.mute.active',
        JSON_EXTRACT(js1.data_json, '$.active'),
        '$.mute.reason',
        JSON_EXTRACT(js1.data_json, '$.reason')
    )
WHERE js1.group_class = 'SettingUserMute';

-- Cheer
UPDATE json_store js1
    JOIN json_store js2 ON
                js1.group_class = 'SettingTwitchCheer'
            AND js1.group_key = js2.group_key
            AND js2.group_class = 'SettingUser'
SET js2.data_json = JSON_SET(
        js2.data_json,
        '$.cheer.totalBits',
        JSON_EXTRACT(js1.data_json, '$.totalBits'),
        '$.cheer.lastBits',
        JSON_EXTRACT(js1.data_json, '$.lastBits')
    )
WHERE js1.group_class = 'SettingTwitchCheer';

-- Sub
UPDATE json_store js1
    JOIN json_store js2 ON
                js1.group_class = 'SettingTwitchSub'
            AND js1.group_key = js2.group_key
            AND js2.group_class = 'SettingUser'
SET js2.data_json = JSON_SET(
        js2.data_json,
        '$.sub.totalMonths',
        JSON_EXTRACT(js1.data_json, '$.totalMonths'),
        '$.sub.streakMonths',
        JSON_EXTRACT(js1.data_json, '$.streakMonths')
    )
WHERE js1.group_class = 'SettingTwitchSub';

-- Delete old rows
DELETE FROM json_store
WHERE group_class IN(
    'SettingUserVoice', 'SettingUserName', 'SettingUserMute',
    'SettingTwitchCheer', 'SettingTwitchSub'
);