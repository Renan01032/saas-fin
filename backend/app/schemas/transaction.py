from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TransactionExtracted(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    description: str
    transaction_date: date
    confidence: float = Field(..., ge=0, le=1)

class MessagePayload(BaseModel):
    phone_number: str
    message_text: Optional[str] = None
    message_type: str = "text"
    media_url: Optional[str] = None
    n8n_secret: str

class TransactionOut(BaseModel):
    id: str
    amount: float
    category: str
    description: Optional[str]
    transaction_date: date
    source: str
    created_at: Optional[str]

    class Config:
        from_attributes = True