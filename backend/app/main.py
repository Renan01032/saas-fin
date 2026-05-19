from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import messages, transactions, users
from app.core.config import settings
from app.db.database import Base, engine

# Cria as tabelas automaticamente no startup
Base.metadata.create_all(bind=engine)

# Defina explicitamente as origens permitidas
origins = [
    "https://saas-fin.vercel.app",   # Seu frontend na Vercel
    "http://localhost:5173",          # Seu ambiente local do Vite
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Troque o "*" pela lista de origens reais
    allow_credentials=True,           # Agora sim isso aqui vai funcionar 100% correto
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/health")
def health_check():
    return {"status": "ok"}