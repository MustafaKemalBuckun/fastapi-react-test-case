from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from fastapi import HTTPException
from . import models, schemas
from ..utils import get_password_hash


def get_user(db: Session, user_id: int):
    try:
        return db.query(models.User).filter(models.User.id == user_id).one()
    except NoResultFound:
        raise HTTPException(status_code=404, detail="User not found.")


def get_user_by_email(db: Session, email: str):
    try:
        return db.query(models.User).filter(models.User.email == email).one()
    except NoResultFound:
        raise HTTPException(status_code=404, detail="User not found.")


def create_user(db: Session, user: schemas.UserCreate):
    now = func.now()
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, password=hashed_password)
    db_user.date_created = now
    db_user.date_modified = now
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
