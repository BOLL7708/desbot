-- Clone the ConfigTwitch object so it can be split up.
INSERT INTO json_store (group_class, group_key, data_json)
SELECT
    "ConfigAnnouncements" as group_class,
    group_key,
    data_json
FROM json_store
WHERE group_class = 'ConfigTwitch' AND group_key = 'Main';

INSERT INTO json_store (group_class, group_key, data_json)
SELECT
    "ConfigCommands" as group_class,
    group_key,
    data_json
FROM json_store
WHERE group_class = 'ConfigTwitch' AND group_key = 'Main';

UPDATE json_store SET group_class = 'ConfigChat' WHERE group_class = 'ConfigTwitchChat' AND group_key = 'Main';