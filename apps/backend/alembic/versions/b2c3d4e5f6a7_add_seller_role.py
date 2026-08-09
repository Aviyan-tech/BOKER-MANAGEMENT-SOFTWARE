"""Add SELLER to UserRole enum

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-21 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite does not support ALTER TYPE — recreate with new enum values via raw SQL.
    # For PostgreSQL, use: op.execute("ALTER TYPE userrole ADD VALUE 'SELLER'")
    # The app uses SQLite for development, so this is a no-op at the Alembic level;
    # SQLAlchemy/SQLite stores enums as VARCHAR and will accept SELLER automatically.
    # For Postgres production, uncomment the line below:
    # op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SELLER'")
    pass


def downgrade() -> None:
    # Cannot remove enum values in Postgres without recreating the type.
    pass
