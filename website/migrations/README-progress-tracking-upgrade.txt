Progress Tracking Migration for ExerciseLog Table

Instructions for schema/column update:

If you do not use Alembic or migration tools:

1. Run these statements directly on your PostgreSQL database:
    ALTER TABLE exercise_log ADD COLUMN weight FLOAT;
    ALTER TABLE exercise_log ADD COLUMN reps INTEGER;
2. If you need to backfill the weight and reps columns, run an appropriate SQL UPDATE or use Python code.
3. If this file is used as an Alembic migration script, ensure 'down_revision' is set properly.

If you use Alembic:

- Place the 'upgrade_exerciselog_progress.py' script into your migrations/versions/ directory.
- Set `down_revision` to your last migration.
- Run: alembic upgrade head

No data will be lost, and new columns will be added with null values for existing rows.
Backfill code for legacy data can be added using an UPDATE statement or with a custom script if business rules require it.
