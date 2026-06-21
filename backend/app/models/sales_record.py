import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SalesRecord(Base):
    __tablename__ = "sales_records"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    product_name: Mapped[str] = mapped_column(String(255), index=True)
    territory: Mapped[str] = mapped_column(String(255), index=True)
    quantity: Mapped[float] = mapped_column(Float)
    revenue: Mapped[float] = mapped_column(Float)
    sale_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
