# I-140 Tracker

Tracks I-140 cases across all USCIS service centers by enumerating receipt numbers.

## Stack

- **Backend**: FastAPI + SQLAlchemy + APScheduler
- **Database**: PostgreSQL
- **Frontend**: React + Recharts + Vite
- **Infrastructure**: Docker Compose

## Setup

### 1. Prerequisites

- Docker + Docker Compose installed
- USCIS API credentials (already in `.env`)

### 2. Start everything

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### 3. Run your first scrape

Click "Run scraper" in the dashboard, or hit the API directly:

```bash
curl -X POST http://localhost:8000/api/scrape/start
```

The scraper runs automatically every 6 hours after startup.

## How it works

1. The scraper iterates through receipt number blocks for all service centers (IOE, MSC, EAC, WAC, LIN, SRC, NBC)
2. It queries the USCIS Case Status API for each number
3. Results with `form_type` containing "140" get stored in Postgres
4. The dashboard aggregates and visualizes the data in real time

## Moving to production

1. Change `USE_PROD=true` in `.env`
2. Demo your app to USCIS at developer.uscis.gov to get production API access
3. Deploy on Railway, Render, or a VPS

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/stats` | Aggregate stats (totals, approval rate, breakdown) |
| `GET /api/cases` | Paginated case list with filters |
| `GET /api/case/{receipt}` | Single case lookup |
| `POST /api/scrape/start` | Trigger a manual scrape run |
| `GET /api/scrape/runs` | Scrape run history |
| `GET /docs` | Interactive API docs |

## Adjusting scrape scope

Edit `scraper.py` to change which year/month blocks to scrape:

```python
for year_short in [24, 25]:       # 2024, 2025
    for center in SERVICE_CENTERS:
        for block in range(1, 13): # months 01-12
```

Narrow this down when testing to avoid burning API quota.
