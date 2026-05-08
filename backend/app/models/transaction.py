from sqlalchemy import Column, String, Float, Date, Boolean, DateTime, DECIMAL, Enum
from sqlalchemy.sql import func
from app.db.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    transaction_date = Column(Date, nullable=False)
    source = Column(
        Enum("whatsapp_text", "whatsapp_image", "dashboard"),
        default="whatsapp_text"
    )
    drive_file_id = Column(String(255), nullable=True)
    ai_confidence = Column(Float, default=0.0)
    is_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())