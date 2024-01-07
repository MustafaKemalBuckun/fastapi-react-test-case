from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy import func
from .users import crud, schemas
from .cards import crud as cards_crud
from .cards import schemas as cards_schema
from .cards import models as cards_model
from .database import get_db
from .config import settings
from sqlalchemy.orm import Session
from . import utils
import re


#this file handles the password hashing and user operations such as login, register etc.


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_regex = r"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}$" #to force users to set stronger passwords.


router = APIRouter()


def authenticate_user(db, email: str, password: str):
   user = crud.get_user_by_email(db, email)
   if not user:
       return False
   if not utils.verify_password(password, user.password):
       return False
   return user


def create_access_token(data: dict, expires_delta: timedelta = None):
   to_encode = data.copy()
   if expires_delta:
       expire = datetime.utcnow() + expires_delta
   else:
       expire = datetime.utcnow() + timedelta(minutes=15)
   to_encode.update({"exp": expire})
   encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.ALGORITHM)
   return encoded_jwt


async def get_current_user(db = Depends(get_db), token: str = Depends(oauth2_scheme)):
   credentials_exception = HTTPException(
       status_code=status.HTTP_401_UNAUTHORIZED,
       detail="Your credentials could not be validated or your session may have expired.",
       headers={"WWW-Authenticate": "Bearer"},
   )
   try:
       payload = jwt.decode(token, settings.secret_key, algorithms=[settings.ALGORITHM])
       email: str = payload.get("sub")
       if email is None:
           raise credentials_exception
       token_data = schemas.TokenData(email=email)
   except JWTError:
       raise credentials_exception
   user = crud.get_user_by_email(db, email=token_data.email)
   if user is None:
       raise credentials_exception
   return user


@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db = Depends(get_db)):
   if not re.match(password_regex, user.password):
       raise HTTPException(
           status_code=400, detail='Password must be at least 8 characters long and include at least one number, one lowercase letter, one uppercase letter, and one special character.'
       )
   try:
       db_user = crud.get_user_by_email(db, email=user.email)
       if db_user:
           raise HTTPException(
               status_code=400, detail="This email is already registered. Please login."
           )
   except HTTPException as e:
       if e.status_code != 404:
           raise
   new_user = crud.create_user(db=db, user=user)
    # Creating a default card for the registered user.
   cards_crud.create_card(db=db, card=cards_schema.CardCreateDefault(label="Default Card"), user_id=new_user.id)
   return new_user


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        
        user = authenticate_user(db, email=user.email, password=user.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email address or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        db_user = crud.get_user_by_email(db, email=user.email)

        if db_user.last_login is None:  #if user logs in for the first time, sets default card's status as 'Active'.
            card = cards_crud.get_cards(db, db_user.id).first()
            card.status = cards_model.CardStatus.ACTIVE
            db.add(card)
            
        db_user.last_login = func.now()
        db.add(db_user)
        db.commit()

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout():
    return {"detail": "Logout Successful"}
