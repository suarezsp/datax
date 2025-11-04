FROM python:3.11-slim

WORKDIR /app

# system deps needed for psycopg2 if using psycopg2 (if you use psycopg2-binary you can skip libpq-dev)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

RUN chmod +x /app/entrypoint.sh /app/wait_for_db.py

EXPOSE 8000
CMD ["/app/entrypoint.sh"]