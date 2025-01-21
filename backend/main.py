import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import submit

# XRPL Configuration
XRPL_NETWORK = os.getenv('XRPL_NETWORK', 'testnet')
XRPL_RPC_URL = os.getenv('XRPL_RPC_URL', 'https://s.altnet.rippletest.net:51234/')

app = FastAPI(
    title="EonXRP Platform",
    description="Decentralized XRP Ecosystem Management Platform",
    version="0.1.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionRequest(BaseModel):
    sender_address: str
    recipient_address: str
    amount: float

class WalletCreationRequest(BaseModel):
    seed: str = None

@app.post("/create-wallet")
async def create_wallet(request: WalletCreationRequest = None):
    try:
        wallet = Wallet.create() if not request or not request.seed else Wallet(seed=request.seed)
        return {
            "address": wallet.address,
            "seed": wallet.seed
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/send-transaction")
async def send_transaction(transaction: TransactionRequest):
    try:
        client = JsonRpcClient(XRPL_RPC_URL)
        
        # Placeholder wallet (in production, use secure wallet management)
        sender_wallet = Wallet.create()
        
        payment = Payment(
            account=sender_wallet.address,
            destination=transaction.recipient_address,
            amount=str(int(transaction.amount * 1_000_000))  # Convert to drops
        )
        
        response = submit(payment, sender_wallet, client)
        return {"status": "success", "transaction_hash": response.result['tx_json']['hash']}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/network-status")
async def get_network_status():
    try:
        client = JsonRpcClient(XRPL_RPC_URL)
        # Placeholder network status check
        return {
            "network": XRPL_NETWORK,
            "rpc_url": XRPL_RPC_URL,
            "status": "operational"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Network unavailable")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
