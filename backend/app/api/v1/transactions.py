from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.transaction import Transaction

router = APIRouter()

@router.get("/")
def list_transactions(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(100).all()
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