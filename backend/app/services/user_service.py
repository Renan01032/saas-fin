import uuid
from sqlalchemy.orm import Session
from app.models.user import User

PLAN_LIMITS = {
    "free": 50,
    "starter": 300,
    "premium": None  # ilimitado
}

def get_or_create_user(db: Session, whatsapp_number: str) -> User:
    user = db.query(User).filter(User.whatsapp_number == whatsapp_number).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            whatsapp_number=whatsapp_number,
            plan="free"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def check_plan_limit(db: Session, user: User) -> bool:
    limit = PLAN_LIMITS.get(user.plan)
    if limit is None:
        return True  # ilimitado
    from sqlalchemy import func, extract
    from app.models.transaction import Transaction
    from datetime import datetime
    now = datetime.now()
    count = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == user.id,
        extract("year", Transaction.created_at) == now.year,
        extract("month", Transaction.created_at) == now.month
    ).scalar()
    return count < limit