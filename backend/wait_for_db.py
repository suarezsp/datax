#!/usr/bin/env python3
import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "hydra_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "hydra_db")
RETRIES = int(os.getenv("DB_WAIT_RETRIES", 60))
SLEEP = float(os.getenv("DB_WAIT_SLEEP", 1.0))

def try_connect():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME,
            connect_timeout=3
        )
        conn.close()
        return True
    except OperationalError as e:
        # print short reason for debugging
        print(f"[wait_for_db] connect failed: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    print(f"[wait_for_db] waiting for DB {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} (retries={RETRIES})")
    for i in range(1, RETRIES + 1):
        if try_connect():
            print("[wait_for_db] DB is ready")
            sys.exit(0)
        else:
            print(f"[wait_for_db] not ready ({i}/{RETRIES}), sleeping {SLEEP}s")
            time.sleep(SLEEP)
    print("[wait_for_db] timed out waiting for DB", file=sys.stderr)
    sys.exit(1)