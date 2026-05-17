import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from app.db.database import get_db
from app.models.transaction import Transaction
from app.core.security import verify_token

router = APIRouter()

class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    category: str
    description: str
    transaction_date: date
    source: str = "dashboard"

@router.get("/")
def list_transactions(user_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Transaction)
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    txs = query.order_by(Transaction.created_at.desc()).limit(500).all()
    return [
        {
            "id": t.id,
            "amount": float(t.amount),
            "category": t.category,
            "description": t.description,
            "transaction_date": str(t.transaction_date),
            "source": t.source,
            "created_at": str(t.created_at),
        }
        for t in txs
    ]

@router.post("/")
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    if not data.user_id:
        raise HTTPException(status_code=400, detail="user_id obrigatório")
    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=data.user_id,
        amount=data.amount,
        category=data.category,
        description=data.description,
        transaction_date=data.transaction_date,
        source=data.source,
        ai_confidence=1.0,
        is_confirmed=True,
    )
    db.add(tx)
    db.commit()
    return {"id": tx.id, "action": "saved", "amount": float(tx.amount), "category": tx.category}

@router.delete("/{tx_id}")
def delete_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(tx)
    db.commit()
    return {"deleted": tx_id}