from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    purchased = Column(Boolean, default=False)
    # New columns added with defaults so existing rows are not broken
    category = Column(String, nullable=False, server_default="Other")
    price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
