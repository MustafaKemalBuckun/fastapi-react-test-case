from sqlalchemy import BigInteger, Column, Integer, String, DateTime, UniqueConstraint, func, ForeignKey, event, and_
from sqlalchemy.orm import relationship, Session
from sqlalchemy.exc import IntegrityError
from enum import IntEnum
from .utils import generate_card_no
from backend.models import Base

class CardStatus(IntEnum):
    PASSIVE = 0
    ACTIVE = 1
    DELETED = 2

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(50))
    card_no = Column(BigInteger)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Integer, default=CardStatus.PASSIVE)
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    date_modified = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
    date_deleted = Column(DateTime(timezone=True), nullable=True)
    owner = relationship("User", back_populates="cards")
    transactions = relationship("Transaction", back_populates="card")
    
    __table_args__ = (UniqueConstraint('card_no', 'user_id', 'date_deleted', name='_card_no_user_id_date_deleted_uc'),)


def add_card_no(mapper, connection, target):
    session = Session(bind=connection)
    if target.card_no is None:
        #generate a unique card_no for the user
        while True:
            card_no = generate_card_no()
            if not card_exists(session, card_no, target.user_id):
                target.card_no = card_no
                break
    else:
        #if user is providing a card_no, checking if it's unique for the user
        if card_exists(session, target.card_no, target.user_id):
            raise IntegrityError("The card number already exists for this user.", "card_no", "Card")


def card_exists(session, card_no, user_id):
    #checking if the card_no exists for any active cards of the user
    exists = session.query(Card).filter(
        and_(
            Card.card_no == card_no,
            Card.user_id == user_id,
            Card.status != CardStatus.DELETED  #filtering out deleted cards to enable users to reuse card_no's that deleted cards had
        )
    ).first()
    return exists is not None

#calling the sqlalchemy event listener to add the card_no before insert operation is made
event.listen(Card, 'before_insert', add_card_no)
