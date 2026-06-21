import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    type: Mapped[str] = mapped_column(String(20))  # monthly, quarterly, annual
    period: Mapped[str] = mapped_column(String(20), index=True)  # e.g. "2026-06"
    product_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    territory: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_value: Mapped[float] = mapped_column(Float)
    current_value: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
