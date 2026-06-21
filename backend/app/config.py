from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://medrepos:medrepos@localhost:5432/medrepos"

    class Config:
        env_file = ".env"


settings = Settings()
