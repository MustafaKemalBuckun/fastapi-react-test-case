from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from fastapi import HTTPException
from . import models, schemas
from backend.cards import models as card_model


def filter_transactions(db: Session, owner_id: int, card_no: Optional[int] = None, card_label: Optional[str] = None, description: Optional[str] = None):
    query = (
        db.query(models.Transaction, card_model.Card.label, card_model.Card.card_no, card_model.Card.status)
        .join(card_model.Card)
        .filter(card_model.Card.user_id == owner_id)
        .filter(card_model.Card.status != card_model.CardStatus.DELETED)
    )

    if card_no is not None:
        query = query.filter(card_model.Card.card_no == card_no)

    if card_label is not None:
        query = query.filter(card_model.Card.label.contains(card_label))

    if description is not None:
        query = query.filter(models.Transaction.description.contains(description))

    return query


def get_transactions(db: Session, owner_id: int, card_no: Optional[int] = None, card_label: Optional[str] = None, description: Optional[str] = None):
    try:
        query = filter_transactions(db, owner_id, card_no, card_label, description)

        transactions = query.order_by(models.Transaction.date_created.desc()).all()

        if not transactions:
            return {"message": "No transactions found."}

        return [
            {
                "id": t.id,
                "amount": t.amount,
                "description": t.description,
                "date_created": t.date_created,
                "card_label": label,
                "card_no": card_no,
                "card_status": status, 
            }
            for t, label, card_no, status in transactions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    try:
        db_transaction = models.Transaction(**transaction.model_dump())
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_report(db: Session, owner_id: int, card_no: Optional[int] = None, card_label: Optional[str] = None, description: Optional[str] = None): #same filters as get_transactions for flexible report generating.
    try:    
        query = filter_transactions(db, owner_id, card_no, card_label, description)

        active_cards_query = db.query(card_model.Card.id).filter(card_model.Card.id.in_(query.with_entities(card_model.Card.id))).filter(card_model.Card.status == card_model.CardStatus.ACTIVE).distinct()  #number of active cards that are used to make transactions.

        total_active_cards = active_cards_query.count()

        total_amount_active_cards = round(query.filter(card_model.Card.status == card_model.CardStatus.ACTIVE).with_entities(func.sum(models.Transaction.amount)).scalar() or 0, 2)
        #total spent with active cards.

        total_amount_passive_cards = round(query.filter(card_model.Card.status == card_model.CardStatus.PASSIVE).with_entities(func.sum(models.Transaction.amount)).scalar() or 0, 2)
        #total spent with passive cards.
        
        total_amount_all_cards = round(total_amount_active_cards + total_amount_passive_cards, 2)

        return {
            "total_active_cards": total_active_cards,
            "total_amount_active_cards": total_amount_active_cards,
            "total_amount_passive_cards": total_amount_passive_cards,
            "total_amount_all_cards": total_amount_all_cards,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
