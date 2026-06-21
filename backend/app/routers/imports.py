import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.import_log import ImportLog
from app.schemas.mission_control import ImportListResponse, ImportResponse
from app.services.import_parser import ImportParser

router = APIRouter(prefix="/api/v1/imports", tags=["imports"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".csv", ".xls", ".xlsx"}


@router.get("")
def list_imports(db: Session = Depends(get_db)) -> ImportListResponse:
    imports = db.query(ImportLog).order_by(ImportLog.created_at.desc()).all()
    return ImportListResponse(
        imports=[ImportResponse.model_validate(i) for i in imports]
    )


@router.post("/upload")
def upload_file(file: UploadFile, db: Session = Depends(get_db)) -> ImportResponse:
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400, f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_name

    content = file.file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    parser = ImportParser()
    try:
        import_log = parser.import_file(file_path, db)
        db.commit()
    except ValueError as e:
        os.remove(file_path)
        raise HTTPException(400, str(e))
    except Exception as e:
        db.rollback()
        os.remove(file_path)
        raise HTTPException(500, f"Import failed: {str(e)}")

    return ImportResponse.model_validate(import_log)
