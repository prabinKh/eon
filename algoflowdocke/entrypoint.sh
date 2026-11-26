#!/bin/sh
set -e

echo "[entrypoint] Waiting for database..."
python3 - <<'PYEOF'
import os, sys, time

db_name = os.getenv("POSTGRES_DB", "algoflow")
db_user = os.getenv("POSTGRES_USER", "algoflow_user")
db_pass = os.getenv("POSTGRES_PASSWORD", "admin")
db_host = os.getenv("POSTGRES_HOST", "db")

# If we are using SQLite, skip the check
env_db_url = os.getenv("DATABASE_URL", "")
if env_db_url.startswith("sqlite") or (not env_db_url and not os.getenv("POSTGRES_DB")):
    print("[entrypoint] Using SQLite, no wait needed.")
    sys.exit(0)

try:
    import psycopg2
except ImportError:
    print("[entrypoint] psycopg2 not installed, skipping check.")
    sys.exit(0)

for attempt in range(30):
    try:
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            host=db_host,
            port=5432,
        )
        conn.close()
        print("[entrypoint] Database is ready.")
        sys.exit(0)
    except Exception as e:
        print(f"[entrypoint] DB not ready yet ({attempt+1}/30): {e}")
        time.sleep(2)
print("[entrypoint] Database never became ready, continuing anyway.")
PYEOF

cd /app/backend

echo "[entrypoint] Running migrations..."
python3 manage.py migrate --noinput

cd /app

echo "[entrypoint] Starting application (Node + Django)..."
exec node dist/server.mjs
