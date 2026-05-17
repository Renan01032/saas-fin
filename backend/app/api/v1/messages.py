import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.transaction import MessagePayload
from app.services.ai_service import extract_transaction
from app.services.user_service import get_or_create_user, check_plan_limit
from app.db.database import get_db
from app.core.config import settings
from app.models.transaction import Transaction

router = APIRouter()

@router.post("/process")
async def process_message(payload: MessagePayload, db: Session = Depends(get_db)):
    """
    Endpoint principal para recebimento de webhooks do n8n/WhatsApp.
    Realiza a validação de segurança, verifica limites e invoca a IA 
    para processar o gasto enviado pelo usuário.
    """
    if payload.n8n_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = get_or_create_user(db, payload.phone_number)

    if not check_plan_limit(db, user):
        return {
            "reply": "⚠️ Você atingiu o limite do plano gratuito. Acesse o site para fazer upgrade.",
            "action": "limit_reached"
        }

    if not payload.message_text:
        return {"reply": "Envie uma mensagem descrevendo seu gasto. Ex: 'Gastei R$45 no iFood hoje'", "action": "need_text"}

    extracted = await extract_transaction(payload.message_text)

    if not extracted:
        return {
            "reply": "Não consegui entender o gasto. Tente: 'Gastei R$45 no iFood hoje'",
            "action": "extraction_failed"
        }

    tx = Transaction(
        id=str(uuid.uuid4()),
        user_id=user.id,
        amount=extracted.amount,
        category=extracted.category,
        description=extracted.description,
        transaction_date=extracted.transaction_date,
        source="whatsapp_text",
        ai_confidence=extracted.confidence,
        is_confirmed=True
    )
    db.add(tx)
    db.commit()

    return {
        "reply": (
            f"✅ *Registrado!*\n"
            f"💰 R${float(extracted.amount):.2f} em {extracted.category.title()}\n"
            f"📝 {extracted.description}\n"
            f"📅 {extracted.transaction_date.strftime('%d/%m/%Y')}"
        ),
        "action": "saved",
        "transaction_id": str(tx.id)
    }