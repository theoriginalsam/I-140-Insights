import asyncio
import logging
import os
import re
import time
from calendar import monthrange
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text

from auth import token_manager, API_URL
from database import engine, SessionLocal, Base
from models import Case, CaseStatusHistory, ScrapeRun
from scraper import CaseScraper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

RECEIPT_RE = re.compile(r"^[A-Z]{3}\d{10}$")

# In-memory rate limiter: ip -> {count, window_start}
_rate_limit: dict = defaultdict(lambda: {"count": 0, "window_start": 0.0})
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW = 900  # 15 min


def check_rate_limit(ip: str) -> bool:
    now = time.time()
    slot = _rate_limit[ip]
    if now - slot["window_start"] > RATE_LIMIT_WINDOW:
        slot["count"] = 0
        slot["window_start"] = now
    slot["count"] += 1
    return slot["count"] <= RATE_LIMIT_MAX


def _migrate(conn):
    """Add new columns to existing tables without data loss."""
    cols = [
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS category VARCHAR(10)",
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS priority_date VARCHAR(20)",
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS premium_processing BOOLEAN DEFAULT FALSE",
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS law_firm VARCHAR(200)",
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_submitted BOOLEAN DEFAULT FALSE",
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS block VARCHAR(10)",
    ]
    for sql in cols:
        try:
            conn.execute(text(sql))
        except Exception as e:
            logger.warning("Migration skipped: %s", e)
    conn.commit()
    # Backfill block from receipt_number (chars 4–8 in 1-indexed PostgreSQL)
    conn.execute(text(
        "UPDATE cases SET block = SUBSTRING(receipt_number, 4, 5) WHERE block IS NULL"
    ))
    conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        _migrate(conn)
    scheduler.add_job(run_scraper_job, "interval", hours=6, id="scraper")
    scheduler.start()
    logger.info("Scheduler started")
    yield
    scheduler.shutdown()


app = FastAPI(title="I-140 Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_scraper_job():
    logger.info("Starting scheduled scrape run")
    db = SessionLocal()
    try:
        scraper = CaseScraper(db)
        await scraper.run()
    finally:
        db.close()


# ---------- Pydantic ----------

class CaseSubmit(BaseModel):
    receipt_number: str
    category: str                     # "NIW" | "EB-1A"
    priority_date: Optional[str] = None
    premium_processing: bool = False
    law_firm: Optional[str] = None
    service_center: Optional[str] = None


# ---------- Stats ----------

@app.get("/api/stats")
def get_stats():
    db = SessionLocal()
    try:
        total = db.query(Case).count()
        approved = db.query(Case).filter(Case.status.ilike("%approved%")).count()
        pending = db.query(Case).filter(Case.status.ilike("%received%")).count()
        rfe = db.query(Case).filter(Case.status.ilike("%request for evidence%")).count()
        denied = db.query(Case).filter(Case.status.ilike("%denied%")).count()

        status_breakdown = [
            {"status": r[0], "count": r[1]}
            for r in db.execute(text(
                "SELECT status, COUNT(*) FROM cases GROUP BY status ORDER BY count(*) DESC LIMIT 20"
            ))
        ]
        by_service_center = [
            {"service_center": r[0], "count": r[1]}
            for r in db.execute(text(
                "SELECT service_center, COUNT(*) FROM cases GROUP BY service_center ORDER BY count(*) DESC"
            ))
        ]
        by_category = [
            {"category": r[0], "count": r[1]}
            for r in db.execute(text(
                "SELECT COALESCE(category,'Unknown'), COUNT(*) FROM cases GROUP BY category ORDER BY count(*) DESC"
            ))
        ]
        last_run = db.query(ScrapeRun).order_by(ScrapeRun.started_at.desc()).first()

        return {
            "total_cases": total,
            "approved": approved,
            "pending": pending,
            "rfe": rfe,
            "denied": denied,
            "approval_rate": round(approved / total * 100, 1) if total > 0 else 0,
            "status_breakdown": status_breakdown,
            "by_service_center": by_service_center,
            "by_category": by_category,
            "last_updated": last_run.started_at.isoformat() if last_run else None,
        }
    finally:
        db.close()


# ---------- Cases list ----------

@app.get("/api/cases")
def get_cases(
    service_center: str = None,
    status: str = None,
    category: str = None,
    block: str = None,
    premium_processing: Optional[bool] = None,
    date_from: str = None,   # YYYY-MM
    date_to: str = None,     # YYYY-MM
    page: int = 1,
    limit: int = 50,
):
    db = SessionLocal()
    try:
        q = db.query(Case)
        if service_center:
            q = q.filter(Case.service_center == service_center.upper())
        if status:
            q = q.filter(Case.status.ilike(f"%{status}%"))
        if category:
            q = q.filter(Case.category == category.upper())
        if block:
            q = q.filter(Case.block == block.upper())
        if premium_processing is not None:
            q = q.filter(Case.premium_processing == premium_processing)
        if date_from:
            try:
                q = q.filter(Case.first_seen >= datetime.strptime(date_from, "%Y-%m"))
            except ValueError:
                pass
        if date_to:
            try:
                dt = datetime.strptime(date_to, "%Y-%m")
                last_day = monthrange(dt.year, dt.month)[1]
                q = q.filter(Case.first_seen <= dt.replace(day=last_day, hour=23, minute=59, second=59))
            except ValueError:
                pass

        total = q.count()
        cases = q.order_by(Case.receipt_number).offset((page - 1) * limit).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "cases": [
                {
                    "receipt_number": c.receipt_number,
                    "service_center": c.service_center,
                    "category": c.category,
                    "status": c.status,
                    "premium_processing": c.premium_processing,
                    "law_firm": c.law_firm,
                    "block": c.block,
                    "received_date": c.received_date,
                    "last_updated": c.last_updated.isoformat() if c.last_updated else None,
                }
                for c in cases
            ],
        }
    finally:
        db.close()


# ---------- Case detail ----------

@app.get("/api/case/{receipt_number}")
def get_case(receipt_number: str):
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.receipt_number == receipt_number.upper()).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        return {
            "receipt_number": case.receipt_number,
            "service_center": case.service_center,
            "category": case.category,
            "status": case.status,
            "status_detail": case.status_detail,
            "received_date": case.received_date,
            "priority_date": case.priority_date,
            "premium_processing": case.premium_processing,
            "law_firm": case.law_firm,
            "last_updated": case.last_updated.isoformat() if case.last_updated else None,
        }
    finally:
        db.close()


# ---------- User submission ----------

@app.post("/api/cases/submit")
async def submit_case(body: CaseSubmit, request: Request):
    ip = request.client.host
    if not check_rate_limit(ip):
        raise HTTPException(status_code=429, detail="Too many submissions. Try again in 15 minutes.")

    receipt = body.receipt_number.upper().strip()
    if not RECEIPT_RE.match(receipt):
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Expected 3 letters + 10 digits (e.g. IOE2512345678).",
        )
    if body.category not in ("NIW", "EB-1A"):
        raise HTTPException(status_code=400, detail="Category must be NIW or EB-1A")

    db = SessionLocal()
    try:
        if db.query(Case).filter(Case.receipt_number == receipt).first():
            raise HTTPException(status_code=409, detail="Case is already being tracked")

        # USCIS verification (best-effort — continues if API is down)
        verified = False
        status_text = "Unknown"
        status_desc = ""
        received_date = ""
        try:
            async with httpx.AsyncClient() as client:
                token = await token_manager.get_token(client)
                resp = await client.get(
                    API_URL.format(receipt=receipt),
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=15,
                )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Case not found in USCIS system")
            if resp.status_code == 200:
                cs = resp.json().get("case_status", {})
                if "140" not in cs.get("form_type", ""):
                    raise HTTPException(status_code=400, detail="Not an I-140 case")
                status_text = cs.get("current_case_status_text_en", "Unknown")
                status_desc = cs.get("current_case_status_desc_en", "")
                received_date = cs.get("received_date", "")
                verified = True
            # 503 / other: fall through without verification
        except HTTPException:
            raise
        except Exception as e:
            logger.warning("USCIS verification failed for %s: %s", receipt, e)

        case = Case(
            receipt_number=receipt,
            service_center=body.service_center or receipt[:3],
            category=body.category,
            priority_date=body.priority_date,
            premium_processing=body.premium_processing,
            law_firm=body.law_firm,
            user_submitted=True,
            block=receipt[3:8],
            status=status_text,
            status_detail=status_desc,
            received_date=received_date,
        )
        db.add(case)
        db.add(CaseStatusHistory(receipt_number=receipt, status=status_text, status_detail=status_desc))
        db.commit()

        return {"message": "Case added successfully", "receipt_number": receipt, "verified": verified}
    finally:
        db.close()


# ---------- Analytics ----------

@app.get("/api/analytics")
def get_analytics():
    db = SessionLocal()
    try:
        timelines = [
            {
                "service_center": r[0],
                "premium_processing": bool(r[1]),
                "count": r[2],
                "avg_days": round(float(r[3]), 1) if r[3] is not None else None,
                "median_days": round(float(r[4]), 1) if r[4] is not None else None,
                "min_days": round(float(r[5]), 1) if r[5] is not None else None,
                "max_days": round(float(r[6]), 1) if r[6] is not None else None,
            }
            for r in db.execute(text("""
                SELECT
                    service_center,
                    COALESCE(premium_processing, false) AS pp,
                    COUNT(*) AS cnt,
                    AVG(EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400),
                    PERCENTILE_CONT(0.5) WITHIN GROUP (
                        ORDER BY EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400
                    ),
                    MIN(EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400),
                    MAX(EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400)
                FROM cases
                WHERE status ILIKE '%approved%'
                  AND last_updated > first_seen
                GROUP BY service_center, pp
                ORDER BY service_center, pp
            """))
        ]

        pp_comparison = [
            {
                "premium_processing": bool(r[0]),
                "total": r[1],
                "approved": r[2],
                "denied": r[3],
                "rfe": r[4],
                "approval_rate": round(r[2] / r[1] * 100, 1) if r[1] > 0 else 0,
                "avg_approval_days": round(float(r[5]), 1) if r[5] is not None else None,
            }
            for r in db.execute(text("""
                SELECT
                    COALESCE(premium_processing, false) AS pp,
                    COUNT(*) AS total,
                    SUM(CASE WHEN status ILIKE '%approved%' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN status ILIKE '%denied%' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN status ILIKE '%request for evidence%' THEN 1 ELSE 0 END),
                    AVG(CASE WHEN status ILIKE '%approved%'
                        THEN EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400
                        ELSE NULL END)
                FROM cases
                GROUP BY pp
                ORDER BY pp
            """))
        ]

        category_breakdown = [
            {
                "category": r[0],
                "total": r[1],
                "approved": r[2],
                "denied": r[3],
                "rfe": r[4],
                "approval_rate": round(r[2] / r[1] * 100, 1) if r[1] > 0 else 0,
            }
            for r in db.execute(text("""
                SELECT
                    COALESCE(category, 'Unknown') AS cat,
                    COUNT(*) AS total,
                    SUM(CASE WHEN status ILIKE '%approved%' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN status ILIKE '%denied%' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN status ILIKE '%request for evidence%' THEN 1 ELSE 0 END)
                FROM cases
                GROUP BY cat
                ORDER BY total DESC
            """))
        ]

        return {
            "processing_timelines": timelines,
            "pp_comparison": pp_comparison,
            "category_breakdown": category_breakdown,
        }
    finally:
        db.close()


# ---------- Firms ----------

@app.get("/api/analytics/firms")
def get_firm_analytics():
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT
                law_firm,
                COUNT(*) AS total,
                SUM(CASE WHEN status ILIKE '%approved%' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status ILIKE '%denied%' THEN 1 ELSE 0 END) AS denied,
                SUM(CASE WHEN status ILIKE '%request for evidence%' THEN 1 ELSE 0 END) AS rfe,
                AVG(CASE WHEN status ILIKE '%approved%'
                    THEN EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400
                    ELSE NULL END) AS avg_days
            FROM cases
            WHERE law_firm IS NOT NULL
            GROUP BY law_firm
            ORDER BY total DESC
            LIMIT 30
        """))
        return {
            "firms": [
                {
                    "law_firm": r[0],
                    "total": r[1],
                    "approved": r[2],
                    "denied": r[3],
                    "rfe": r[4],
                    "approval_rate": round(r[2] / r[1] * 100, 1) if r[1] > 0 else 0,
                    "avg_approval_days": round(float(r[5]), 1) if r[5] is not None else None,
                }
                for r in rows
            ]
        }
    finally:
        db.close()


# ---------- My Case ----------

@app.get("/api/cases/{receipt_number}/mycase")
def get_my_case(receipt_number: str):
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.receipt_number == receipt_number.upper()).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        history = (
            db.query(CaseStatusHistory)
            .filter(CaseStatusHistory.receipt_number == receipt_number.upper())
            .order_by(CaseStatusHistory.recorded_at)
            .all()
        )

        age_days = (datetime.utcnow() - case.first_seen).days if case.first_seen else None
        prefix = case.receipt_number[:7]   # center + year + block (7 chars)

        peer = db.execute(text("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status ILIKE '%approved%' THEN 1 ELSE 0 END),
                SUM(CASE WHEN status ILIKE '%received%' THEN 1 ELSE 0 END),
                SUM(CASE WHEN status ILIKE '%request for evidence%' THEN 1 ELSE 0 END),
                AVG(CASE WHEN status ILIKE '%approved%'
                    THEN EXTRACT(EPOCH FROM (last_updated - first_seen)) / 86400
                    ELSE NULL END)
            FROM cases
            WHERE receipt_number LIKE :prefix
        """), {"prefix": f"{prefix}%"}).fetchone()

        return {
            "receipt_number": case.receipt_number,
            "service_center": case.service_center,
            "category": case.category,
            "status": case.status,
            "status_detail": case.status_detail,
            "received_date": case.received_date,
            "priority_date": case.priority_date,
            "premium_processing": case.premium_processing,
            "law_firm": case.law_firm,
            "age_days": age_days,
            "first_seen": case.first_seen.isoformat() if case.first_seen else None,
            "last_updated": case.last_updated.isoformat() if case.last_updated else None,
            "status_history": [
                {"status": h.status, "recorded_at": h.recorded_at.isoformat()}
                for h in history
            ],
            "peer_comparison": {
                "block": prefix,
                "total": peer[0],
                "approved": peer[1],
                "pending": peer[2],
                "rfe": peer[3],
                "approval_rate": round(peer[1] / peer[0] * 100, 1) if peer[0] > 0 else 0,
                "avg_approval_days": round(float(peer[4]), 1) if peer[4] is not None else None,
            },
        }
    finally:
        db.close()


# ---------- Scraper controls ----------

ADMIN_KEY = os.getenv("ADMIN_KEY", "changeme123")


def require_admin(request: Request):
    key = request.headers.get("X-Admin-Key", "")
    if not key or key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing admin key")


@app.post("/api/scrape/start")
async def start_scrape(request: Request):
    require_admin(request)
    asyncio.create_task(run_scraper_job())
    return {"message": "Scrape started in background"}


@app.get("/api/scrape/runs")
def get_scrape_runs():
    db = SessionLocal()
    try:
        runs = db.query(ScrapeRun).order_by(ScrapeRun.started_at.desc()).limit(20).all()
        return [
            {
                "id": r.id,
                "started_at": r.started_at.isoformat(),
                "finished_at": r.finished_at.isoformat() if r.finished_at else None,
                "cases_checked": r.cases_checked,
                "cases_found": r.cases_found,
                "status": r.status,
            }
            for r in runs
        ]
    finally:
        db.close()
