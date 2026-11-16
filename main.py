from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Item

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shopping List API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                    # local Vite dev server
        "https://shopping-list-api-ujr4.onrender.com",  # Render backend (health checks)
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # any Vercel preview or production URL
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_CATEGORIES = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Meat & Fish",
    "Bakery",
    "Drinks",
    "Snacks",
    "Cleaning",
    "Vegetarian",
    "Other",
]


class ItemCreate(BaseModel):
    name: str
    quantity: int
    purchased: bool = False
    category: str = "Other"
    price: Optional[float] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    purchased: Optional[bool] = None
    category: Optional[str] = None
    price: Optional[float] = None


@app.get("/")
def read_root():
    return {"message": "Shopping List API is running"}


@app.post("/items", status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    if item.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {VALID_CATEGORIES}")
    new_item = Item(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@app.get("/items")
def get_items(
    purchased: Optional[bool] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[Literal["name", "created_at"]] = "created_at",
    db: Session = Depends(get_db),
):
    query = db.query(Item)

    if purchased is not None:
        query = query.filter(Item.purchased == purchased)

    if category:
        query = query.filter(Item.category == category)

    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))

    if sort == "name":
        query = query.order_by(Item.name.asc())
    else:
        query = query.order_by(Item.created_at.asc())

    return query.all()


@app.get("/items/history")
def get_history(db: Session = Depends(get_db)):
    """Returns all purchased items sorted by most recently created."""
    return db.query(Item).filter(Item.purchased == True).order_by(Item.created_at.desc()).all()


@app.get("/items/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.put("/items/{item_id}")
def update_item(item_id: int, updated: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if updated.category and updated.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category.")
    for field, value in updated.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.patch("/items/{item_id}/purchased")
def toggle_purchased(item_id: int, db: Session = Depends(get_db)):
    """Toggle purchased status on/off."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.purchased = not item.purchased
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
