from pydantic_settings import BaseSettings
from dotenv import load_dotenv, find_dotenv
import os


load_dotenv(find_dotenv())


class Settings(BaseSettings):
    db_name: str = os.getenv('DB_NAME')
    db_user: str = os.getenv('DB_USER')
    db_password: str = os.getenv('DB_PASSWORD')
    db_host: str = os.getenv('DB_HOST')
    db_port: int = os.getenv('DB_PORT')
    secret_key: str = os.getenv('SECRET_KEY')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 #you can adjust expiration time of access token here.
    ALGORITHM: str = os.getenv('ALGORITHM', 'HS256')


settings = Settings()
