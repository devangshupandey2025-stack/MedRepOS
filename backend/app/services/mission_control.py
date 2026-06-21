from datetime import UTC, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.import_log import ImportLog
from app.models.sales_record import SalesRecord


def get_mission_control(db: Session) -> dict:
    now = datetime.now(UTC)

    # --- Health Score (computed from goals) ---
    goals = db.query(Goal).all()
    achievement_ratios = []
    for g in goals:
        if g.target_value > 0:
            ratio = min(g.current_value / g.target_value, 1.0)
            achievement_ratios.append(ratio)

    if achievement_ratios:
        avg_achievement = sum(achievement_ratios) / len(achievement_ratios)
    else:
        avg_achievement = 0.0

    target_score = round(avg_achievement * 40)
    growth_score = 18
    coverage_score = 15
    risk_adj_score = 15
    total = target_score + growth_score + coverage_score + risk_adj_score

    health_score = {
        "total": total,
        "breakdown": [
            {"label": "Target Achievement", "score": target_score, "max": 40},
            {"label": "Growth", "score": growth_score, "max": 20},
            {"label": "Coverage", "score": coverage_score, "max": 20},
            {"label": "Risk Adjustment", "score": risk_adj_score, "max": 20},
        ],
    }

    # --- Monthly Progress ---
    monthly_goal = (
        db.query(func.sum(Goal.target_value), func.sum(Goal.current_value))
        .filter(Goal.type == "monthly")
        .first()
    )
    target_total = monthly_goal[0] or 0
    current_total = monthly_goal[1] or 0
    progress_pct = round((current_total / target_total * 100)) if target_total > 0 else 0

    # --- Forecast ---
    total_revenue = (
        db.query(func.sum(SalesRecord.revenue)).scalar() or 0
    )
    forecast_pct = 0
    if target_total > 0:
        forecast_pct = round((total_revenue / target_total * 100))

    # --- Risks ---
    risks = []
    products = (
        db.query(SalesRecord.product_name)
        .distinct()
        .all()
    )
    for (pname,) in products:
        result = (
            db.query(
                func.sum(SalesRecord.quantity).label("total_qty"),
                func.sum(SalesRecord.revenue).label("total_rev"),
            )
            .filter(SalesRecord.product_name == pname)
            .first()
        )
        if result and result.total_qty is not None and result.total_qty < 10:
            risks.append({
                "title": f"{pname} low volume",
                "detail": f"Only {int(result.total_qty)} units sold",
                "severity": "warning",
            })

    if not risks:
        risks = [
            {"title": "No risks detected", "detail": "All metrics within acceptable range", "severity": "info"},
        ]

    # --- Opportunities ---
    opportunities = []
    top_products = (
        db.query(
            SalesRecord.product_name,
            func.sum(SalesRecord.revenue).label("total_rev"),
        )
        .group_by(SalesRecord.product_name)
        .order_by(func.sum(SalesRecord.revenue).desc())
        .limit(3)
        .all()
    )
    for pname, trev in top_products:
        opportunities.append({
            "title": pname,
            "detail": f"Top performer with ₹{trev:,.0f} revenue",
            "value": f"+₹{trev * 0.15:,.0f} potential",
            "trend": "up",
        })

    if not opportunities:
        opportunities = [
            {"title": "No data yet", "detail": "Import sales records to see opportunities", "value": "—", "trend": "up"},
        ]

    # --- Timeline ---
    recent_imports = (
        db.query(ImportLog)
        .order_by(ImportLog.created_at.desc())
        .limit(5)
        .all()
    )
    timeline = []
    for imp in recent_imports:
        timeline.append({
            "time": imp.created_at.strftime("%I:%M %p").lstrip("0"),
            "text": f"Import {'completed' if imp.status == 'completed' else imp.status}: {imp.filename}",
            "type": "positive" if imp.status == "completed" else "neutral",
        })

    if not timeline:
        timeline = [
            {"time": "—", "text": "No activity yet. Import your first file.", "type": "neutral"},
        ]

    # --- Brief ---
    brief_lines = []
    if progress_pct > 0:
        brief_lines.append(
            f"You are at {progress_pct}% of your monthly target."
        )
    if risks and risks[0]["severity"] != "info":
        brief_lines.append(
            f"Risks detected: {risks[0]['title']}."
        )
    if opportunities and opportunities[0]["title"] != "No data yet":
        brief_lines.append(
            f"Top opportunity: {opportunities[0]['title']} with {opportunities[0]['value']}."
        )

    if not brief_lines:
        brief_lines.append("Import sales data to generate your executive brief.")

    return {
        "health_score": health_score,
        "monthly_progress": {"value": progress_pct, "days_remaining": 30 - now.day},
        "forecast": {"value": forecast_pct, "change": 0, "direction": "up"},
        "priorities": [
            {"text": "Review recent imports for data quality", "type": "review"},
            {"text": "Check goal progress and adjust targets", "type": "followup"},
            {"text": "Follow up on top opportunities", "type": "growth"},
        ],
        "risks": risks,
        "opportunities": opportunities,
        "brief": " ".join(brief_lines),
        "timeline": timeline,
    }
