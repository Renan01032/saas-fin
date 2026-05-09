from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_NAME: str = "saas_fin"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    JWT_SECRET_KEY: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 15
    N8N_WEBHOOK_SECRET: str = "secret"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()