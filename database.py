import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

_url = os.environ["DATABASE_URL"]

# Neon provides URLs starting with "postgresql://".
# SQLAlchemy with psycopg3 requires "postgresql+psycopg://".
# This handles both so local Docker and Neon URLs both work.
if _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+psycopg://", 1)

# sslmode=require in the query string is enough for Neon.
# No extra connect_args needed.
engine = create_engine(_url)

SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
