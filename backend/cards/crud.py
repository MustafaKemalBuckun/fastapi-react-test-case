from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from . import models, schemas
from sqlalchemy import func, event
import random


def get_card(db: Session, card_id: int):
    try:
        return db.query(models.Card).filter(models.Card.id == card_id).one()
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Card not found.")


def get_cards(db: Session, owner_id: int):
    return db.query(models.Card).filter(models.Card.user_id == owner_id, models.Card.status.in_([0, 1])).order_by(models.Card.date_modified.desc())


def create_card(db: Session, card: schemas.CardCreateUpdate, user_id: int):
    db_card = models.Card(**card.model_dump(), user_id=user_id)
    try:
        if db_card.card_no and not card.card_no.isdigit():
            raise HTTPException(status_code=400, detail="The card number must contain only numbers.")
        if db_card.status is None:
            db_card.status = schemas.CardStatus.PASSIVE

        db.add(db_card)
        db.commit()
        db.refresh(db_card)

        return db_card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def update_card(db: Session, card_id: int, card: schemas.CardCreateUpdate):
    try:
        db_card = db.query(models.Card).filter(models.Card.id == card_id).one()

        active_cards = db.query(models.Card).filter(models.Card.user_id == db_card.user_id, models.Card.status == models.CardStatus.ACTIVE).count()

        if card.status == models.CardStatus.PASSIVE and db_card.status != models.CardStatus.PASSIVE and active_cards <= 1:
            raise HTTPException(status_code=400, detail="At least one card must remain active.") #ensuring there's at least one active card.
        
        for var, value in card.model_dump().items():
            setattr(db_card, var, value)
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def delete_card(db: Session, card_id: int):
    try:
        db_card = db.query(models.Card).filter(models.Card.id == card_id).one()
        active_cards = db.query(models.Card).filter(models.Card.user_id == db_card.user_id, models.Card.status == models.CardStatus.ACTIVE).count()
        if db_card.status == models.CardStatus.ACTIVE and active_cards <= 1:
            raise HTTPException(status_code=400, detail="At least one card must remain active.")
        db_card.status = models.CardStatus.DELETED
        db_card.date_deleted = func.now() 
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
