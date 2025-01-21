import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# SQLAlchemy Database Configuration
DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    'sqlite:///./eonxrp.db'  # Default to SQLite if no URL provided
)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if 'sqlite' in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
