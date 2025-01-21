# EonXRP: Decentralized XRP Ecosystem Platform 

## Overview
EonXRP is a comprehensive blockchain platform leveraging the XRP Ledger, designed to provide seamless financial interactions and advanced blockchain management.

## Features
- User Authentication
- XRP Wallet Management
- Transaction Processing
- Real-time Network Monitoring
- Secure Blockchain Interactions

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy
- **Blockchain**: XRPL
- **Authentication**: JWT
- **Database**: PostgreSQL/SQLite
- **Deployment**: Railway, Vercel

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- pip
- npm

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/oneznzeros/EON_XRP.git

# Navigate to backend
cd eon-xrp/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

### Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables
Create a `.env` file with:
```
XRPL_NETWORK=testnet
DATABASE_URL=sqlite:///./eonxrp.db
SECRET_KEY=your_secret_key
```

## Deployment
Configured for automatic deployment via GitHub Actions to:
- Railway (Backend)
- Vercel (Frontend)

## API Documentation
Access Swagger UI at `/docs` when the server is running

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Contact
- Email: support@eonxrp.com
- Discord: https://discord.gg/eonxrp
