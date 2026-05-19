from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import messages, transactions, users
from app.core.config import settings
from app.db.database import Base, engine

# Cria as tabelas automaticamente no startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SaaS Fin API",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/health")
def health_check():
    return {"status": "ok"}