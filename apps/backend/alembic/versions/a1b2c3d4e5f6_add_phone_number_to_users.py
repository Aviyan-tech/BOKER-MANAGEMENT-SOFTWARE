"""Add phone_number to users

Revision ID: a1b2c3d4e5f6
Revises: 0990b14784ef
Create Date: 2026-07-19 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '0990b14784ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))
    op.add_column('listings', sa.Column('dimensions', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'phone_number')
    op.drop_column('listings', 'dimensions')
