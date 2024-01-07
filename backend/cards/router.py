from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.users.schemas import User as user_schema
from . import crud, schemas
from ..auth import get_current_user


router = APIRouter()


@router.post("/cards/add", response_model=schemas.Card)
def create_card(card: schemas.CardCreateUpdate, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return crud.create_card(db=db, card=card, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cards/update/{card_id}", response_model=schemas.CardCreateUpdate)
def update_card(card_id: int, card: schemas.CardCreateUpdate, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id=card_id)
    if db_card is None or db_card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    try:
        return crud.update_card(db=db, card_id=card_id, card=card)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cards", response_model=List[schemas.Card])
def read_cards(current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        cards = crud.get_cards(db, owner_id=current_user.id)
        return cards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cards/get/{card_id}", response_model=schemas.Card)
def read_card(card_id: int, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    card = crud.get_card(db, card_id=card_id)
    if card is None or card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    try:
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cards/delete/{card_id}")
def delete_card(card_id: int, current_user: user_schema = Depends(get_current_user), db: Session = Depends(get_db)):
    db_card = crud.get_card(db, card_id=card_id)
    if db_card is None or db_card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    try:
        return crud.delete_card(db=db, card_id=card_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
