import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from xrpl.wallet import Wallet
from xrpl.clients import JsonRpcClient
from xrpl.models.transactions import Payment, TokenMint
from xrpl.transaction import submit
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Platform Configuration
PLATFORM_SUPPORT_EMAIL = os.getenv('PLATFORM_SUPPORT_EMAIL', 'support@eonxrp.com')

class EONXRPPlatform:
    def __init__(self, network='testnet'):
        """
        Initialize the EON XRP Platform
        
        :param network: Network to connect to (testnet or mainnet)
        """
        if network == 'testnet':
            self.client = JsonRpcClient('https://s.altnet.rippletest.net:51234/')
        elif network == 'mainnet':
            self.client = JsonRpcClient('https://xrplcluster.com/')
        else:
            raise ValueError("Invalid network. Choose 'testnet' or 'mainnet'")
        
        self.support_email = PLATFORM_SUPPORT_EMAIL
    
    def create_meme_token(self, creator_wallet: Wallet, token_name: str, total_supply: int = 1_000_000_000):
        """
        Create a new meme token on the XRP Ledger
        
        :param creator_wallet: Wallet of the token creator
        :param token_name: Name of the meme token
        :param total_supply: Total supply of tokens
        :return: Token creation transaction result
        """
        # Mint tokens
        mint_tx = TokenMint(
            account=creator_wallet.classic_address,
            token_tax_amount='0',
            uri=f"https://eonxrp.com/memes/{token_name.lower().replace(' ', '-')}",
            flags=8  # Enable transferable flag
        )
        
        try:
            response = submit(mint_tx, creator_wallet, self.client)
            return {
                "status": "success",
                "token_name": token_name,
                "transaction_hash": response.result.get('tx_json', {}).get('hash'),
                "support_contact": self.support_email
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "support_contact": self.support_email
            }
    
    def create_nft_collection(self, creator_wallet: Wallet, collection_name: str, description: str):
        """
        Create an NFT collection on the XRP Ledger
        
        :param creator_wallet: Wallet of the NFT collection creator
        :param collection_name: Name of the NFT collection
        :param description: Description of the NFT collection
        :return: Collection creation result
        """
        # Mint a collection NFT
        mint_tx = TokenMint(
            account=creator_wallet.classic_address,
            uri=f"https://eonxrp.com/nft-collections/{collection_name.lower().replace(' ', '-')}",
            flags=8,  # Enable transferable flag
        )
        
        try:
            response = submit(mint_tx, creator_wallet, self.client)
            return {
                "status": "success",
                "collection_name": collection_name,
                "transaction_hash": response.result.get('tx_json', {}).get('hash'),
                "support_contact": self.support_email
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "support_contact": self.support_email
            }

# FastAPI Application
app = FastAPI(
    title="EON XRP Platform",
    description="Meme Token, NFT, and Token Creation Platform on XRP Ledger",
    version="0.1.0",
    contact={
        "name": "EON XRP Support",
        "email": PLATFORM_SUPPORT_EMAIL,
    }
)

# Global platform instance
platform = EONXRPPlatform()

@app.post("/create-meme-token")
async def create_meme_token(token_details: Dict[str, Any]):
    """
    API endpoint to create a meme token
    
    :param token_details: Details of the meme token to create
    :return: Token creation result
    """
    try:
        # In a real-world scenario, you'd validate the wallet and credentials
        creator_wallet = Wallet.create()
        
        result = platform.create_meme_token(
            creator_wallet, 
            token_details.get('name', 'EON Meme'),
            token_details.get('total_supply', 1_000_000_000)
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create-nft-collection")
async def create_nft_collection(collection_details: Dict[str, Any]):
    """
    API endpoint to create an NFT collection
    
    :param collection_details: Details of the NFT collection to create
    :return: Collection creation result
    """
    try:
        # In a real-world scenario, you'd validate the wallet and credentials
        creator_wallet = Wallet.create()
        
        result = platform.create_nft_collection(
            creator_wallet,
            collection_details.get('name', 'EON NFT Collection'),
            collection_details.get('description', 'A unique NFT collection')
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def main():
    """
    Main entry point for the EON XRP Platform
    """
    print("EON XRP Platform Initialized")
    print(f"Support Contact: {PLATFORM_SUPPORT_EMAIL}")
    print("Ready to create meme tokens and NFT collections!")

if __name__ == "__main__":
    main()
