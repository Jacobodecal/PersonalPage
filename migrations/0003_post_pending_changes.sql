-- Edits to a published post are held here (JSON of title/slug/excerpt/body_md)
-- until "Update" applies them, so the live page doesn't change while typing.
ALTER TABLE posts ADD COLUMN pending_changes TEXT;
