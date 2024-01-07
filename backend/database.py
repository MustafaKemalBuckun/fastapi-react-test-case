from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings
from backend.models import Base
from backend.users.models import User
from backend.cards.models import Card
from backend.transactions.models import Transaction
from sqlalchemy import text


DATABASE_URL = f"mysql+pymysql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/"

server_engine = create_engine(DATABASE_URL)

with server_engine.connect() as connection:
    connection.execute(text(f"CREATE DATABASE IF NOT EXISTS {settings.db_name}"))
    connection.execute(text(f"USE {settings.db_name}"))

DATABASE_URL_WITH_DB = f"{DATABASE_URL}{settings.db_name}"
engine = create_engine(DATABASE_URL_WITH_DB)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def get_db():
 db = SessionLocal()
 try:
     yield db
 finally:
     db.close()
