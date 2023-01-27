-- Fill empty group keys
UPDATE `settings` SET `groupKey`=UUID() WHERE `groupKey` IS NULL;

-- Disallow group keys to be empty
ALTER TABLE `settings` CHANGE `groupKey` `groupKey` VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;