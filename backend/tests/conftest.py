"""
Stub out heavy DB/auth dependencies before scraper.py imports them,
so tests run without psycopg2 or a live Postgres connection.
"""
import sys
from unittest.mock import MagicMock

sys.modules.setdefault("database", MagicMock())
sys.modules.setdefault("models", MagicMock())
sys.modules.setdefault("auth", MagicMock())
