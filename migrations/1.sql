UPDATE json_store
SET group_key = REPLACE(REPLACE(REPLACE(group_key, 'Reward & Command', 'Default'), 'Reward', 'Default'), 'Command', 'Default')
WHERE group_class = 'EventDefault'
  AND JSON_EXTRACT(data_json, '$.category') = (SELECT row_id
                                               FROM json_store
                                               WHERE group_class = 'PresetEventCategory'
                                                 AND group_key = 'Default Imports');

UPDATE json_store
SET group_key = REPLACE(group_key, 'Command', 'Bonus')
WHERE group_class = 'EventDefault'
  AND JSON_EXTRACT(data_json, '$.category') = (SELECT row_id
                                               FROM json_store
                                               WHERE group_class = 'PresetEventCategory'
                                                 AND group_key = 'Bonus Imports');