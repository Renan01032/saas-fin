from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from app.core.config import settings

def hash_password(password: str) -> str:
    """Gera um hash seguro para a senha do usuário utilizando a biblioteca bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """
    Gera um token JWT (JSON Web Token) para autenticação das sessões 
    no dashboard, com tempo de expiração configurável.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)