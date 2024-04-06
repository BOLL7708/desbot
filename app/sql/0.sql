/* Turn on foreign key support. */
PRAGMA foreign_keys = ON;

/* Create main table with foreign key. */
CREATE TABLE IF NOT EXISTS json_store
(
    row_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    row_created  TEXT NOT NULL DEFAULT (datetime('now')),
    row_modified TEXT NOT NULL DEFAULT (datetime('now')),
    group_class  TEXT NOT NULL,
    group_key    TEXT NOT NULL,
    parent_id    INTEGER,
    data_json    TEXT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES json_store (row_id) ON DELETE CASCADE
);

/* Add non-primary indices. */
CREATE UNIQUE INDEX IF NOT EXISTS unique_group ON json_store (group_class, group_key);
CREATE INDEX IF NOT EXISTS parent_id_index ON json_store (parent_id);

/* Add trigger to handle modified time. */
CREATE TRIGGER IF NOT EXISTS update_row_modified
    AFTER UPDATE
    ON json_store
    FOR EACH ROW
BEGIN
    UPDATE json_store SET row_modified = datetime('now') WHERE row_id = NEW.row_id;
END;