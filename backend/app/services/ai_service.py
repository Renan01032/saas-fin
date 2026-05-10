import json
from datetime import date
from openai import OpenAI
from app.core.config import settings
from app.schemas.transaction import TransactionExtracted

# Groq usa SDK compatível com OpenAI
client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

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
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": message}
            ],
            max_tokens=300,
            temperature=0.1
        )
        
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        
        print(f"Groq raw response: {raw}")
        
        data = json.loads(raw)
        extracted = TransactionExtracted(**data)
        
        if extracted.confidence < 0.5:
            return None
            
        return extracted
    except Exception as e:
        print(f"AI extraction error: {e}")
        return None