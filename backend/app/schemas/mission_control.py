from datetime import datetime

from pydantic import BaseModel


class SalesRecordResponse(BaseModel):
    id: str
    product_name: str
    territory: str
    quantity: float
    revenue: float
    sale_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ImportResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    total_rows: int
    successful_rows: int
    error_rows: int
    created_at: datetime

    class Config:
        from_attributes = True


class ImportListResponse(BaseModel):
    imports: list[ImportResponse]


class GoalResponse(BaseModel):
    id: str
    type: str
    period: str
    product_name: str | None
    territory: str | None
    target_value: float
    current_value: float

    class Config:
        from_attributes = True


class HealthScoreBreakdown(BaseModel):
    label: str
    score: int
    max: int


class HealthScore(BaseModel):
    total: int
    breakdown: list[HealthScoreBreakdown]


class Priority(BaseModel):
    text: str
    type: str


class Risk(BaseModel):
    title: str
    detail: str
    severity: str


class Opportunity(BaseModel):
    title: str
    detail: str
    value: str
    trend: str


class TimelineEvent(BaseModel):
    time: str
    text: str
    type: str


class MissionControlResponse(BaseModel):
    health_score: HealthScore
    monthly_progress: dict
    forecast: dict
    priorities: list[Priority]
    risks: list[Risk]
    opportunities: list[Opportunity]
    brief: str
    timeline: list[TimelineEvent]
