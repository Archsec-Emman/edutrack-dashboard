from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import SessionLocal, Assignment
from typing import List

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AssignmentCreate(BaseModel):
    student_name: str
    score: float
    max_score: float

class AssignmentOut(AssignmentCreate):
    id: int

@app.post("/assignments/", response_model=AssignmentOut)
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    db_assignment = Assignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.get("/assignments/", response_model=List[AssignmentOut])
def list_assignments(db: Session = Depends(get_db)):
    return db.query(Assignment).all()

@app.get("/")
def root():
    return {"message": "EduTrack API is running"}