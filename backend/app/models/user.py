from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    whatsapp_number = Column(String(20), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    plan = Column(String(20), default="free")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())