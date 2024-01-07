from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.users.schemas import User as user_schema
from . import crud, schemas
from ..auth import get_current_user
from ..cards import crud as cards_crud
from typing import List, Optional


router = APIRouter()


@router.post("/transactions/add", response_model=schemas.TransactionCreate)
def create_transaction(transaction: schemas.TransactionCreate, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    card = cards_crud.get_card(db, card_id=transaction.card_id)
    if card is None or card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    try:
        return crud.create_transaction(db=db, transaction=transaction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions")
def read_transactions(card_no: Optional[int] = None, card_label: Optional[str] = None, description: Optional[str] = None, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, owner_id=current_user.id, card_no=card_no, card_label=card_label, description=description)
    return transactions


@router.get("/transactions/report")
def get_transactions_report(card_no: Optional[int] = None, card_label: Optional[str] = None, description: Optional[str] = None, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    report = crud.get_report(db, owner_id=current_user.id, card_no=card_no, card_label=card_label, description=description)
    return report
