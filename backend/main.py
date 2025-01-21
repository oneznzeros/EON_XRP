import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from src.services.auth import authenticate_user, create_access_token, create_user
from src.integrations.xrpl_client import XRPLClient
from src.models.user import Base
from src.schemas.user import UserCreate, UserResponse, UserLogin
from src.database import engine, get_db

# Database initialization
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EonXRP Platform",
    description="Comprehensive XRP Blockchain Management Platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# XRPL Client
xrpl_client = XRPLClient(network=os.getenv('XRPL_NETWORK', 'testnet'))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication Routes
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        created_user = create_user(db, user)
        return created_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# XRPL Routes
@app.post("/wallet/create")
def create_xrpl_wallet():
    return xrpl_client.create_wallet()

@app.get("/wallet/balance/{address}")
def get_wallet_balance(address: str):
    return {"balance": xrpl_client.get_balance(address)}

@app.post("/transaction/send")
def send_xrp_transaction(sender_seed: str, recipient: str, amount: float):
    sender_wallet = Wallet(seed=sender_seed)
    return xrpl_client.send_transaction(sender_wallet, recipient, amount)

@app.get("/transaction/history/{address}")
def get_transaction_history(address: str):
    return xrpl_client.get_transaction_history(address)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
