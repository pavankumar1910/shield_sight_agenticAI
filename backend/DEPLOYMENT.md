# Deployment Guide

## Prerequisites

- Python 3.8+
- pip
- 2GB RAM minimum

## Production Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file:

API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO

### 3. Run with Gunicorn (Production)
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 4. Run with Docker (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Security Checklist

- [ ] Enable HTTPS
- [ ] Add API key authentication
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Enable request logging
- [ ] Set up monitoring

## Monitoring

Use `/health`, `/stats`, and `/metrics` endpoints for monitoring.