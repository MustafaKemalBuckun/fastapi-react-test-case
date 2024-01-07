from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import BigInteger, Column
from .models import CardStatus
from datetime import datetime


class CardBase(BaseModel):
    label: str
    card_no: Optional[int] | None = Field(sa_column=Column(BigInteger))
    status: CardStatus


class CardCreateUpdate(BaseModel):
    label: str = Field(..., min_length=1)
    card_no: Optional[int] | None = Field(sa_column=Column(BigInteger))
    status: CardStatus = Field(..., ge=0, le=2)  #restricting the possible inputs.


class CardCreateDefault(BaseModel):
    label: str


class Card(CardBase):
    id: int
    user_id: int
    date_created: datetime
    date_modified: datetime
    date_deleted: Optional[datetime]

    class Config:
        orm_mode = True
