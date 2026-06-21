from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.goal import Goal
from app.schemas.mission_control import GoalResponse

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


@router.get("")
def list_goals(db: Session = Depends(get_db)) -> list[GoalResponse]:
    goals = db.query(Goal).order_by(Goal.created_at.desc()).all()
    return [GoalResponse.model_validate(g) for g in goals]
