import json
from datetime import date
import google.generativeai as genai
from app.core.config import settings
from app.schemas.transaction import TransactionExtracted

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

SYSTEM_PROMPT = """Você é um assistente financeiro. Extraia dados de gastos de mensagens em português.
Responda APENAS com JSON válido, sem texto extra, sem markdown, sem blocos de código.
Formato obrigatório:
{{
  "amount": 45.00,
  "category": "alimentação",
  "description": "iFood - pizza",
  "transaction_date": "2024-01-15",
  "confidence": 0.95
}}
Categorias válidas: alimentação, transporte, moradia, saúde, lazer, educação, vestuário, outros.
Se "hoje" use a data: {today}. Se não conseguir extrair o valor, use confidence: 0.0.
Data atual: {today}"""

async def extract_transaction(message: str) -> TransactionExtracted | None:
    try:
        prompt = SYSTEM_PROMPT.replace("{today}", str(date.today()))
        full_prompt = f"{prompt}\n\nMensagem do usuário: {message}"
        
        response = model.generate_content(full_prompt)
        raw = response.text.strip()
        
        # Remove possíveis blocos markdown que o Gemini às vezes adiciona
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        print(f"Gemini raw response: {raw}")
        
        data = json.loads(raw)
        extracted = TransactionExtracted(**data)
        
        if extracted.confidence < 0.5:
            return None
            
        return extracted
    except Exception as e:
        print(f"AI extraction error: {e}")
        return None