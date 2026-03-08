from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from database import Base


class Case(Base):
    __tablename__ = "cases"

    receipt_number = Column(String(20), primary_key=True, index=True)
    service_center = Column(String(10), index=True)
    category = Column(String(10), nullable=True, index=True)      # NIW | EB-1A
    priority_date = Column(String(20), nullable=True)
    premium_processing = Column(Boolean, default=False, index=True)
    law_firm = Column(String(200), nullable=True, index=True)
    user_submitted = Column(Boolean, default=False)
    block = Column(String(10), nullable=True, index=True)          # receipt_number[3:8]
    status = Column(String(200), index=True)
    status_detail = Column(Text, nullable=True)
    received_date = Column(String(50), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    first_seen = Column(DateTime, default=datetime.utcnow)


class CaseStatusHistory(Base):
    __tablename__ = "case_status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    receipt_number = Column(String(20), index=True)
    status = Column(String(200))
    status_detail = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class ScrapeRun(Base):
    __tablename__ = "scrape_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    cases_checked = Column(Integer, default=0)
    cases_found = Column(Integer, default=0)
    blocked_count = Column(Integer, default=0)        # 503/429/CF responses
    successful_requests = Column(Integer, default=0)  # 200 responses
    status = Column(String(20), default="running")  # running, completed, failed
