from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.cards.router import router as cards_router
from backend.transactions.router import router as transactions_router
from backend.auth import router as auth_router
import uvicorn


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(cards_router)
app.include_router(transactions_router)
app.include_router(auth_router, prefix="/auth")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
