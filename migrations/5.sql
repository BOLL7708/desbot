ALTER TABLE `json_store` MODIFY COLUMN `rowId` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `json_store` CHANGE COLUMN `rowId` `row_id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `json_store` CHANGE COLUMN `rowCreated` `row_created` datetime NOT NULL DEFAULT current_timestamp();
ALTER TABLE `json_store` CHANGE COLUMN `rowModified` `row_modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();
ALTER TABLE `json_store` CHANGE COLUMN `groupClass` `group_class` varchar(128) NOT NULL;
ALTER TABLE `json_store` CHANGE COLUMN `groupKey` `group_key` varchar(128) NOT NULL;
ALTER TABLE `json_store` CHANGE COLUMN `dataJson` `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;