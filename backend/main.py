from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import SessionLocal, Assignment
from typing import List, Optional
from datetime import datetime
import math
import numpy as np  # will add to requirements

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- Pydantic models ----
class AssignmentCreate(BaseModel):
    student_name: str
    subject: str = "Math"
    score: float
    max_score: float
    auto_graded: bool = False

class AssignmentOut(AssignmentCreate):
    id: int
    created_at: datetime

class AutoGradeRequest(BaseModel):
    student_name: str
    subject: str
    function_name: str  # e.g., "sin", "cos", "square"
    user_answer: float
    x_value: float

# ---- CRUD endpoints ----
@app.post("/assignments/", response_model=AssignmentOut)
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    db_assignment = Assignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.get("/assignments/", response_model=List[AssignmentOut])
def list_assignments(db: Session = Depends(get_db)):
    return db.query(Assignment).order_by(Assignment.created_at.desc()).all()

@app.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "deleted"}

# ---- Statistics endpoints ----
@app.get("/stats/avg_score")
def average_score(db: Session = Depends(get_db)):
    assignments = db.query(Assignment).all()
    if not assignments:
        return {"average": 0}
    percentages = [(a.score / a.max_score) * 100 for a in assignments]
    return {"average": sum(percentages) / len(percentages)}

@app.get("/stats/distribution")
def score_distribution(db: Session = Depends(get_db)):
    assignments = db.query(Assignment).all()
    if not assignments:
        return {"bins": [0,20,40,60,80,100], "counts": [0,0,0,0,0,0]}
    percentages = [(a.score / a.max_score) * 100 for a in assignments]
    bins = [0,20,40,60,80,100]
    counts = [0]*5
    for p in percentages:
        for i in range(len(bins)-1):
            if bins[i] <= p < bins[i+1]:
                counts[i] += 1
    return {"bins": bins, "counts": counts}

# ---- Auto-grading endpoint ----
@app.post("/auto-grade/")
def auto_grade(req: AutoGradeRequest, db: Session = Depends(get_db)):
    # Reference functions
    funcs = {
        "sin": lambda x: math.sin(x),
        "cos": lambda x: math.cos(x),
        "square": lambda x: x**2,
        "exp": lambda x: math.exp(x/10)
    }
    if req.function_name not in funcs:
        raise HTTPException(status_code=400, detail="Unknown function")
    true_value = funcs[req.function_name](req.x_value)
    error = abs(req.user_answer - true_value)
    tolerance = 1e-3
    score = 100.0 if error <= tolerance else max(0, 100 - (error / tolerance)*50)
    # Save auto-graded assignment
    assignment = Assignment(
        student_name=req.student_name,
        subject=f"Auto: {req.function_name}(x) at x={req.x_value}",
        score=score,
        max_score=100,
        auto_graded=True
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {
        "correct_answer": true_value,
        "user_score": score,
        "assignment_id": assignment.id
    }

@app.get("/")
def root():
    return {"message": "EduTrack API with auto-grading"}