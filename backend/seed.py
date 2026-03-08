"""
Seed the DB with realistic NIW/EB-1A cases for local testing.
Run inside the backend container:
    python seed.py
"""
import random
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from models import Case, CaseStatusHistory, ScrapeRun

Base.metadata.create_all(bind=engine)

CENTERS = ["IOE", "MSC", "EAC", "WAC", "LIN"]

LAW_FIRMS = [
    "Chen Immigration Law Associates",
    "North America Immigration Law Group",
    "Ellis Porter",
    "VisaNation",
    "Murthy Law Firm",
    "Fragomen",
    "Berry Appleman & Leiden",
    "Self-Petitioner",
]

STATUSES_NIW = [
    ("Case Was Approved",
     "On {date}, we approved your Form I-140, Immigrant Petition for Alien Workers, "
     "for the classification of Alien of Exceptional Ability (National Interest Waiver)."),
    ("Case Was Received",
     "On {date}, we received your Form I-140, Immigrant Petition for Alien Workers, "
     "for the classification of Alien of Exceptional Ability (National Interest Waiver), "
     "and sent you a receipt notice."),
    ("Request for Evidence Was Sent",
     "On {date}, we mailed a request for evidence for your Form I-140, Immigrant Petition "
     "for Alien Workers, for the classification of Alien of Exceptional Ability "
     "(National Interest Waiver)."),
    ("Case Is Being Actively Reviewed",
     "On {date}, we began actively reviewing your Form I-140, Immigrant Petition for Alien "
     "Workers (National Interest Waiver)."),
    ("Response To USCIS' Request For Evidence Was Received",
     "On {date}, we received your response to our request for evidence for your Form I-140 "
     "(National Interest Waiver)."),
    ("Case Was Denied",
     "On {date}, we denied your Form I-140, Immigrant Petition for Alien Workers "
     "(National Interest Waiver)."),
]

STATUSES_EB1A = [
    ("Case Was Approved",
     "On {date}, we approved your Form I-140, Immigrant Petition for Alien Workers, "
     "for the classification of Alien of Extraordinary Ability (EB-1A)."),
    ("Case Was Received",
     "On {date}, we received your Form I-140, Immigrant Petition for Alien Workers, "
     "for the classification of Alien of Extraordinary Ability (EB-1A)."),
    ("Request for Evidence Was Sent",
     "On {date}, we mailed a request for evidence for your Form I-140, Immigrant Petition "
     "for Alien Workers (Extraordinary Ability / EB-1A)."),
    ("Case Is Being Actively Reviewed",
     "On {date}, we began actively reviewing your Form I-140, Immigrant Petition for Alien "
     "Workers, for Alien of Extraordinary Ability (EB-1A)."),
    ("Case Was Denied",
     "On {date}, we denied your Form I-140, Immigrant Petition for Alien Workers (EB-1A)."),
]

# NIW weight: approved 52%, received 26%, rfe 9%, review 7%, rfe-response 4%, denied 2%
NIW_WEIGHTS = [52, 26, 9, 7, 4, 2]
# EB-1A weight: approved 48%, received 28%, rfe 12%, review 8%, denied 4%
EB1A_WEIGHTS = [48, 28, 12, 8, 4]


def rand_date(year=2024):
    start = datetime(year, 1, 1)
    end = datetime(2025, 12, 31)
    return (start + timedelta(days=random.randint(0, (end - start).days))).strftime("%B %d, %Y")


def make_receipt(center: str, idx: int) -> str:
    year = random.choice([24, 25])
    block = random.randint(1, 12)
    return f"{center}{year:02d}{block:02d}{idx:06d}"


db = SessionLocal()
db.query(CaseStatusHistory).delete()
db.query(Case).delete()
db.query(ScrapeRun).delete()
db.commit()

cases = []
history = []
idx = 1

for center in CENTERS:
    n = random.randint(200, 280)
    for _ in range(n):
        category = random.choices(["NIW", "EB-1A"], weights=[70, 30])[0]
        pp = random.random() < 0.22
        firm = random.choice(LAW_FIRMS)
        statuses, weights = (STATUSES_NIW, NIW_WEIGHTS) if category == "NIW" else (STATUSES_EB1A, EB1A_WEIGHTS)
        status_text, status_desc_tmpl = random.choices(statuses, weights=weights)[0]
        date_str = rand_date()
        receipt = make_receipt(center, idx)
        idx += 1

        first_seen = datetime(2025, 1, 1) + timedelta(days=random.randint(0, 365))

        # Realistic processing times
        if "approved" in status_text.lower():
            if pp:
                days_to_decision = random.randint(5, 25)
            else:
                days_to_decision = random.randint(30, 180)
            last_updated = first_seen + timedelta(days=days_to_decision)
        elif "denied" in status_text.lower():
            last_updated = first_seen + timedelta(days=random.randint(60, 300))
        else:
            last_updated = first_seen + timedelta(days=random.randint(1, 60))

        c = Case(
            receipt_number=receipt,
            service_center=center,
            category=category,
            priority_date=f"20{random.randint(20, 24):02d}-{random.randint(1, 12):02d}",
            premium_processing=pp,
            law_firm=firm,
            user_submitted=False,
            block=receipt[3:8],
            status=status_text,
            status_detail=status_desc_tmpl.format(date=date_str),
            received_date=date_str,
            first_seen=first_seen,
            last_updated=last_updated,
        )
        cases.append(c)
        history.append(CaseStatusHistory(
            receipt_number=receipt,
            status=status_text,
            status_detail=status_desc_tmpl.format(date=date_str),
            recorded_at=first_seen,
        ))

db.bulk_save_objects(cases)
db.bulk_save_objects(history)
db.add(ScrapeRun(
    started_at=datetime.utcnow() - timedelta(minutes=14),
    finished_at=datetime.utcnow() - timedelta(minutes=2),
    cases_checked=94000,
    cases_found=len(cases),
    status="completed",
))
db.commit()
db.close()

print(f"Seeded {len(cases)} cases ({sum(1 for c in cases if c.category=='NIW')} NIW, "
      f"{sum(1 for c in cases if c.category=='EB-1A')} EB-1A) across {len(CENTERS)} centers.")
