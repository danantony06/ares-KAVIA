"""Upgrade ExerciseLog structure for progress tracking

Revision ID: progress_tracking_001
Revises: 
Create Date: 2024-06-11

"""
from alembic import op
import sqlalchemy as sa

# Revision identifiers, used by Alembic
revision = 'progress_tracking_001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """Upgrade ExerciseLog to include progress-tracking for weight and reps."""
    # Add new columns for progress if they do not exist
    with op.batch_alter_table('exercise_log') as batch_op:
        batch_op.add_column(sa.Column('weight', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('reps', sa.Integer(), nullable=True))
    # Optionally, you might want to backfill data here, if possible


def downgrade():
    """Downgrade ExerciseLog to remove progress-tracking columns."""
    with op.batch_alter_table('exercise_log') as batch_op:
        batch_op.drop_column('weight')
        batch_op.drop_column('reps')

"""
Instructions:
1. If your project uses Alembic, move this script into your migrations/versions/ folder.
2. Update `down_revision` to the current most recent revision if you use Alembic; set `down_revision` appropriately.
3. Run `alembic upgrade head` to apply.
4. If Alembic is not used, you can instead run the following SQL:
    ALTER TABLE exercise_log ADD COLUMN weight FLOAT;
    ALTER TABLE exercise_log ADD COLUMN reps INTEGER;
5. No destructive operations—existing data will be preserved. If you need to backfill historic data for these columns, add Python code in your migration or use SQL UPDATE statements.
"""
