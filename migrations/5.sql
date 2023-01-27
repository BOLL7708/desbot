ALTER TABLE `json_store` CHANGE COLUMN `rowId` `row_id` int(11);
ALTER TABLE `json_store` CHANGE COLUMN `rowCreated` `row_created` datetime;
ALTER TABLE `json_store` CHANGE COLUMN `rowModified` `row_modified` datetime;
ALTER TABLE `json_store` CHANGE COLUMN `groupClass` `group_class` varchar(128);
ALTER TABLE `json_store` CHANGE COLUMN `groupKey` `group_key` varchar(128);
ALTER TABLE `json_store` CHANGE COLUMN `dataJson` `data_json` longtext;