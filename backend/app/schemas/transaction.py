from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TransactionExtracted(BaseModel):
    amount: float = Field(..., gt=0, description="Valor em reais")
    category: str = Field(..., description="Categoria do gasto")
    description: str = Field(..., description="Descrição curta")
    transaction_date: date = Field(..., description="Data do gasto")
    confidence: float = Field(..., ge=0, le=1)

class MessagePayload(BaseModel):
    phone_number: str
    message_text: Optional[str] = None
    message_type: str = "text"
    media_url: Optional[str] = None
    n8n_secret: str