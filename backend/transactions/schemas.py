from pydantic import BaseModel
from datetime import datetime
from backend.cards.models import CardStatus

class TransactionBase(BaseModel):
    amount: float
    description: str

class TransactionCreate(TransactionBase):
    card_id: int

class TransactionsGet(TransactionBase):
    card_label: str
    card_no: int
    card_status: CardStatus

class Transaction(TransactionBase):
    id: int
    date_created: datetime
    date_modified: datetime

    class Config:
        orm_mode = True
