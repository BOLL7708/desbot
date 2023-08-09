ALTER TABLE `json_store` ADD `parent_id` INT NULL AFTER `group_key`;
ALTER TABLE `json_store` ADD FOREIGN KEY (`parent_id`) REFERENCES `json_store`(`row_id`) ON DELETE CASCADE ON UPDATE RESTRICT;