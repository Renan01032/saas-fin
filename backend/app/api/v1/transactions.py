import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel
from datetime import date
from app.db.database import get_db
from app.models.transaction import Transaction

router = APIRouter()

class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    category: str
    description: str
    transaction_date: date
    source: str = "dashboard"

@router.get("/")
def list_transactions(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(200).all()
    return [
        {
            "id": t.id,
            "amount": float(t.amount),
            "category": t.category,
            "description": t.description,
            "transaction_date": str(t.transaction_date),
            "source": t.source,
            "created_at": str(t.created_at)
        }
        for t in txs
    ]

@router.post("/")
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=data.user_id,
        amount=data.amount,
        category=data.category,
        description=data.description,
        transaction_date=data.transaction_date,
        source=data.source,
        ai_confidence=1.0,
        is_confirmed=True
    )
    db.add(tx)
    db.commit()
    return {
        "id": tx.id,
        "action": "saved",
        "amount": float(tx.amount),
        "category": tx.category
    }