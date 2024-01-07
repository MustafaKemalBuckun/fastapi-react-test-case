from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
   email: EmailStr


class UserCreate(UserBase):
   password: str


class User(UserBase):
   id: int
   date_created: datetime
   date_modified: datetime

   class Config:
       orm_mode = True


class UserLogin(BaseModel):
   email: EmailStr
   password: str


class Token(BaseModel):
   access_token: str
   token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
