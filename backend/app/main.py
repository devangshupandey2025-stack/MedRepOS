from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import goals, imports, mission_control

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedRepOS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mission_control.router)
app.include_router(imports.router)
app.include_router(goals.router)


@app.get("/health")
def health():
    return {"status": "ok"}
