"""
Run this once to add new columns to the existing items table.
Safe to run multiple times — it skips columns that already exist.
"""
from sqlalchemy import text
from database import engine

migrations = [
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS category VARCHAR NOT NULL DEFAULT 'Other'",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS price FLOAT",
    "ALTER TABLE items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()",
]

with engine.connect() as conn:
    for sql in migrations:
        conn.execute(text(sql))
    conn.commit()
    print("Migration complete.")
