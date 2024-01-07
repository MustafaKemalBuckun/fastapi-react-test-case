from sqlalchemy import Column, Float, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from backend.models import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    description = Column(String(255))
    card_id = Column(Integer, ForeignKey("cards.id"))
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    date_modified = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
    card = relationship("Card", back_populates="transactions")
