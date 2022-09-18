-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
    -- Rows
    `rowId` int(11) NOT NULL AUTO_INCREMENT,
    `rowCreated` datetime NOT NULL DEFAULT current_timestamp(),
    `rowModified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `groupClass` varchar(64) NOT NULL,
    `groupKey` varchar(64) DEFAULT NULL,
    `dataJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    -- Indices
    PRIMARY KEY (`rowId`),
    UNIQUE KEY `unique_group` (`groupClass`,`groupKey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;