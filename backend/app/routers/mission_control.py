from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.mission_control import get_mission_control

router = APIRouter(prefix="/api/v1", tags=["mission-control"])


@router.get("/mission-control")
def mission_control(db: Session = Depends(get_db)):
    return get_mission_control(db)
